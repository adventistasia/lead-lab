#!/usr/bin/env python3
"""Coordinate Matic issue ownership through an atomic GitHub ref.

The claim ref is a small Git history, not the delivery branch. Creating the
ref is the atomic claim operation. Later state changes append a single-parent
commit and advance the ref without force, so competing updates cannot both
win from the same ref head.
"""

from __future__ import annotations

import argparse
import base64
import copy
import datetime as datetime_module
import json
import re
import subprocess
import sys
import uuid
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Callable, Dict, Mapping, Optional, Sequence


DEFAULT_REPOSITORY = "adventistasia/lead-lab"
DEFAULT_BASE_BRANCH = "staging"
CLAIM_SCHEMA = "matic-claim/v1"
CLAIM_REF_PREFIX = "refs/heads/matic-claims/issue-"
CLAIM_API_REF_PREFIX = "heads/matic-claims/issue-"
CLAIM_PATH_PREFIX = ".matic-claims/issue-"

ALLOWED_STATUSES = {
    "active",
    "blocked",
    "paused",
    "awaiting-review",
    "awaiting-merge",
    "complete",
    "ineligible",
    "released",
}
IDLE_STATUSES = {
    "blocked",
    "paused",
    "awaiting-review",
    "awaiting-merge",
    "complete",
    "ineligible",
    "released",
}
TERMINAL_STATUSES = {"complete", "ineligible", "released"}
CONTENTION_EXIT_CODE = 2
ERROR_EXIT_CODE = 1


class ClaimError(Exception):
    """A controlled claim or workflow error."""

    code = "claim-error"


class OwnershipError(ClaimError):
    """The caller does not hold the current execution token."""

    code = "ownership-error"


class GitHubApiError(ClaimError):
    """A GitHub CLI/API request failed."""

    code = "github-api-error"

    def __init__(self, message: str, status: Optional[int] = None):
        super().__init__(message)
        self.status = status


class ClaimConflict(ClaimError):
    """Another operator won a create or compare-and-swap update."""

    code = "claim-conflict"

    def __init__(self, message: str, existing: Optional["ClaimSnapshot"] = None):
        super().__init__(message)
        self.existing = existing


@dataclass(frozen=True)
class ClaimSnapshot:
    """The verified current claim record and the commit that stores it."""

    head_sha: str
    data: Dict[str, Any]


def utc_now() -> str:
    return (
        datetime_module.datetime.now(datetime_module.timezone.utc)
        .replace(microsecond=0)
        .isoformat()
        .replace("+00:00", "Z")
    )


def issue_ref(issue_number: int) -> str:
    validate_issue_number(issue_number)
    return f"{CLAIM_API_REF_PREFIX}{issue_number}"


def full_issue_ref(issue_number: int) -> str:
    validate_issue_number(issue_number)
    return f"{CLAIM_REF_PREFIX}{issue_number}"


def claim_path(issue_number: int) -> str:
    validate_issue_number(issue_number)
    return f"{CLAIM_PATH_PREFIX}{issue_number}.json"


def validate_issue_number(issue_number: int) -> None:
    if isinstance(issue_number, bool) or not isinstance(issue_number, int) or issue_number < 1:
        raise ClaimError("Issue number must be a positive integer.")


def validate_login(login: str, field_name: str = "operator login") -> str:
    value = str(login or "").strip()
    if not value or any(character.isspace() for character in value):
        raise ClaimError(f"{field_name} must be a non-empty GitHub login.")
    if any(character in value for character in "\r\n"):
        raise ClaimError(f"{field_name} cannot contain a line break.")
    return value


def slugify(title: str) -> str:
    value = re.sub(r"[^a-z0-9]+", "-", str(title).lower()).strip("-")
    value = value[:50].rstrip("-")
    return value or "issue"


def validate_repository_path(value: str, field_name: str) -> str:
    raw_path = str(value or "").strip()
    if not raw_path or raw_path.startswith("/") or "\\" in raw_path:
        raise ClaimError(f"{field_name} must be a repository-relative path.")
    path = raw_path.rstrip("/")
    if not path:
        raise ClaimError(f"{field_name} must be a repository-relative path.")
    if any(part in {".", ".."} for part in path.split("/")):
        raise ClaimError(f"{field_name} cannot contain . or .. path segments.")
    return path


def validate_run_path(value: str) -> str:
    path = validate_repository_path(value, "Run path")
    if not path.startswith("application/runs/"):
        raise ClaimError("Run path must be under application/runs/.")
    return path


def validate_work_branch(branch: str, issue_number: int) -> str:
    validate_issue_number(issue_number)
    value = str(branch or "").strip()
    expected_prefix = f"matic/issue-{issue_number}-"
    if not value.startswith(expected_prefix):
        raise ClaimError(f"Work branch must start with {expected_prefix}.")
    if (
        any(character.isspace() for character in value)
        or ".." in value
        or "//" in value
        or "@{" in value
        or value.endswith("/")
        or not re.fullmatch(r"[A-Za-z0-9._/-]+", value)
    ):
        raise ClaimError("Work branch contains an invalid Git ref component.")
    return value


def clean_title(title: str) -> str:
    value = " ".join(str(title or "").split())
    if not value:
        raise ClaimError("The GitHub issue title is required.")
    return value


def validate_issue_for_claim(issue: Mapping[str, Any], issue_number: int) -> str:
    validate_issue_number(issue_number)
    if issue.get("pull_request"):
        raise ClaimError(f"Issue #{issue_number} is a pull request, not an issue.")
    if str(issue.get("state", "")).lower() != "open":
        raise ClaimError(f"Issue #{issue_number} is not open.")
    labels = {
        label.get("name")
        for label in issue.get("labels", [])
        if isinstance(label, Mapping)
    }
    if "matic" not in labels:
        raise ClaimError(f"Issue #{issue_number} does not have the exact matic label.")
    return clean_title(str(issue.get("title", "")))


def _ref_sha(reference: Mapping[str, Any]) -> str:
    value = reference.get("object")
    if not isinstance(value, Mapping) or not value.get("sha"):
        raise ClaimError("GitHub returned a reference without an object SHA.")
    if value.get("type") not in {None, "commit"}:
        raise ClaimError("The Matic claim reference must point to a commit.")
    return str(value["sha"])


def _tree_sha(commit: Mapping[str, Any]) -> str:
    value = commit.get("tree")
    if not isinstance(value, Mapping) or not value.get("sha"):
        raise ClaimError("GitHub returned a commit without a tree SHA.")
    return str(value["sha"])


def _api_status(stderr: str, stdout: str = "") -> Optional[int]:
    match = re.search(r"\bHTTP\s+(\d{3})\b", f"{stderr}\n{stdout}")
    return int(match.group(1)) if match else None


class GitHubClient:
    """Small gh-api adapter so claim behavior can be tested without GitHub."""

    def __init__(self, repository: str = DEFAULT_REPOSITORY, gh_binary: str = "gh"):
        self.repository = repository
        self.gh_binary = gh_binary

    def api(
        self,
        endpoint: str,
        method: str = "GET",
        payload: Optional[Mapping[str, Any]] = None,
    ) -> Any:
        command = [self.gh_binary, "api", endpoint]
        if method.upper() != "GET":
            command.extend(["--method", method.upper()])
        input_value: Optional[str] = None
        if payload is not None:
            command.extend(["--input", "-"])
            input_value = json.dumps(payload, sort_keys=True)

        try:
            completed = subprocess.run(
                command,
                input=input_value,
                text=True,
                capture_output=True,
                check=False,
            )
        except (OSError, subprocess.SubprocessError) as error:
            raise GitHubApiError(f"Could not run gh api: {error}") from error
        if completed.returncode != 0:
            status = _api_status(completed.stderr, completed.stdout)
            detail = completed.stderr.strip() or completed.stdout.strip() or "request failed"
            raise GitHubApiError(f"gh api {endpoint} failed: {detail}", status=status)
        if not completed.stdout.strip():
            return None
        try:
            return json.loads(completed.stdout)
        except json.JSONDecodeError as error:
            raise GitHubApiError(
                f"gh api {endpoint} returned invalid JSON: {error}"
            ) from error

    def current_user(self) -> str:
        response = self.api("user")
        if not isinstance(response, Mapping):
            raise ClaimError("GitHub user response was not an object.")
        return validate_login(str(response.get("login", "")))

    def get_issue(self, issue_number: int) -> Mapping[str, Any]:
        return self.api(f"repos/{self.repository}/issues/{issue_number}")

    def get_ref(self, ref_name: str) -> Mapping[str, Any]:
        return self.api(f"repos/{self.repository}/git/ref/{ref_name}")

    def get_ref_optional(self, ref_name: str) -> Optional[Mapping[str, Any]]:
        try:
            return self.get_ref(ref_name)
        except GitHubApiError as error:
            if error.status == 404:
                return None
            raise

    def get_commit(self, sha: str) -> Mapping[str, Any]:
        return self.api(f"repos/{self.repository}/git/commits/{sha}")

    def get_tree(self, sha: str) -> Mapping[str, Any]:
        return self.api(f"repos/{self.repository}/git/trees/{sha}?recursive=1")

    def get_blob(self, sha: str) -> Mapping[str, Any]:
        return self.api(f"repos/{self.repository}/git/blobs/{sha}")

    def create_blob(self, content: str) -> str:
        response = self.api(
            f"repos/{self.repository}/git/blobs",
            method="POST",
            payload={"content": content, "encoding": "utf-8"},
        )
        return _response_sha(response, "the claim record blob")

    def create_tree(self, base_tree: str, path: str, blob_sha: str) -> str:
        response = self.api(
            f"repos/{self.repository}/git/trees",
            method="POST",
            payload={
                "base_tree": base_tree,
                "tree": [
                    {
                        "path": path,
                        "mode": "100644",
                        "type": "blob",
                        "sha": blob_sha,
                    }
                ],
            },
        )
        return _response_sha(response, "the claim record tree")

    def create_commit(self, message: str, tree_sha: str, parent_sha: str) -> str:
        response = self.api(
            f"repos/{self.repository}/git/commits",
            method="POST",
            payload={
                "message": message,
                "tree": tree_sha,
                "parents": [parent_sha],
            },
        )
        return _response_sha(response, "the claim record commit")

    def create_ref(self, full_ref: str, sha: str) -> Mapping[str, Any]:
        return self.api(
            f"repos/{self.repository}/git/refs",
            method="POST",
            payload={"ref": full_ref, "sha": sha},
        )

    def update_ref(self, ref_name: str, sha: str) -> Mapping[str, Any]:
        # force=false makes the GitHub ref update fast-forward-only.
        return self.api(
            f"repos/{self.repository}/git/refs/{ref_name}",
            method="PATCH",
            payload={"sha": sha, "force": False},
        )


def _require_sha(value: str, description: str) -> str:
    if not value:
        raise ClaimError(f"GitHub did not return a SHA for {description}.")
    return value


def _response_sha(response: Any, description: str) -> str:
    if not isinstance(response, Mapping):
        raise ClaimError(f"GitHub returned no object for {description}.")
    return _require_sha(str(response.get("sha", "")), description)


def _run_id(run_path: str) -> str:
    return run_path.rstrip("/").rsplit("/", 1)[-1]


def _transition_record(
    current: Mapping[str, Any],
    new: Mapping[str, Any],
    actor: str,
    reason: str,
    at: str,
) -> Dict[str, Any]:
    transition: Dict[str, Any] = {
        "at": at,
        "by": actor,
        "from_status": current.get("status"),
        "to_status": new.get("status"),
        "from_owner_login": current.get("owner_login"),
        "to_owner_login": new.get("owner_login"),
        "from_execution_id": current.get("execution_id"),
        "to_execution_id": new.get("execution_id"),
    }
    if reason:
        transition["reason"] = reason
    return transition


def _validate_claim_record(data: Mapping[str, Any], issue_number: int) -> None:
    required = {
        "schema",
        "issue_number",
        "issue_title",
        "claim_ref",
        "owner_login",
        "execution_id",
        "execution_active",
        "generation",
        "status",
        "run_path",
        "work_branch",
        "base_branch",
        "base_sha",
        "claimed_at",
        "updated_at",
        "last_transition",
    }
    missing = sorted(field for field in required if field not in data)
    if missing:
        raise ClaimError(f"Claim record is missing fields: {', '.join(missing)}.")
    if data.get("schema") != CLAIM_SCHEMA:
        raise ClaimError("Claim record has an unsupported schema.")
    if data.get("issue_number") != issue_number:
        raise ClaimError("Claim record issue number does not match its ref.")
    if data.get("claim_ref") != full_issue_ref(issue_number):
        raise ClaimError("Claim record ref does not match its issue.")
    validate_login(str(data.get("owner_login", "")), "claim owner login")
    status = data.get("status")
    if status not in ALLOWED_STATUSES:
        raise ClaimError(f"Claim record has an unsupported status: {status!r}.")
    if not isinstance(data.get("execution_active"), bool):
        raise ClaimError("Claim record execution_active must be a boolean.")
    if data.get("execution_active") and not data.get("execution_id"):
        raise ClaimError("An active claim must have an execution ID.")
    if not data.get("execution_active") and data.get("execution_id") is not None:
        raise ClaimError("An idle claim must not retain an active execution ID.")
    if status in IDLE_STATUSES and data.get("execution_active"):
        raise ClaimError("An idle claim status cannot have an active execution.")
    if status == "active" and not data.get("execution_active"):
        raise ClaimError("An active claim status must have an active execution.")
    if not isinstance(data.get("generation"), int) or data.get("generation") < 1:
        raise ClaimError("Claim generation must be a positive integer.")
    if not isinstance(data.get("last_transition"), Mapping):
        raise ClaimError("Claim last_transition must be an object.")
    validate_run_path(str(data.get("run_path", "")))
    validate_work_branch(str(data.get("work_branch", "")), issue_number)
    if not data.get("base_branch") or not data.get("base_sha"):
        raise ClaimError("Claim base branch and base SHA are required.")


class ClaimManager:
    """Perform claim operations against one repository."""

    def __init__(
        self,
        client: Any,
        operator_login: str,
        now: Callable[[], str] = utc_now,
        execution_id_factory: Callable[[], str] = lambda: str(uuid.uuid4()),
    ):
        self.client = client
        self.operator_login = validate_login(operator_login)
        self.now = now
        self.execution_id_factory = execution_id_factory

    def read(self, issue_number: int) -> Optional[ClaimSnapshot]:
        validate_issue_number(issue_number)
        reference = self.client.get_ref_optional(issue_ref(issue_number))
        if reference is None:
            return None
        head_sha = _ref_sha(reference)
        commit = self.client.get_commit(head_sha)
        tree = self.client.get_tree(_tree_sha(commit))
        if tree.get("truncated"):
            raise ClaimError("GitHub returned a truncated claim tree; claim ownership is unknown.")
        entries = tree.get("tree")
        if not isinstance(entries, list):
            raise ClaimError("GitHub returned an invalid claim tree.")
        expected_path = claim_path(issue_number)
        entry = next(
            (
                candidate
                for candidate in entries
                if isinstance(candidate, Mapping)
                and candidate.get("path") == expected_path
            ),
            None,
        )
        if not isinstance(entry, Mapping) or entry.get("type") != "blob":
            raise ClaimError(
                f"Claim ref {full_issue_ref(issue_number)} exists without {expected_path}."
            )
        blob = self.client.get_blob(str(entry.get("sha", "")))
        if blob.get("encoding") != "base64" or not blob.get("content"):
            raise ClaimError("GitHub returned an unreadable claim blob.")
        try:
            decoded = base64.b64decode(
                str(blob["content"]).replace("\n", ""), validate=True
            )
            data = json.loads(decoded.decode("utf-8"))
        except (ValueError, UnicodeDecodeError, json.JSONDecodeError) as error:
            raise ClaimError(f"Claim record is not valid UTF-8 JSON: {error}") from error
        if not isinstance(data, Mapping):
            raise ClaimError("Claim record must contain a JSON object.")
        record = dict(data)
        _validate_claim_record(record, issue_number)
        return ClaimSnapshot(head_sha=head_sha, data=record)

    def claim(
        self,
        issue_number: int,
        base_branch: str = DEFAULT_BASE_BRANCH,
        run_path: Optional[str] = None,
        work_branch: Optional[str] = None,
        stage: str = "01-select",
    ) -> Dict[str, Any]:
        validate_issue_number(issue_number)
        existing = self.read(issue_number)
        if existing is not None:
            raise ClaimConflict(
                f"Issue #{issue_number} is already claimed by "
                f"{existing.data['owner_login']}.",
                existing,
            )

        issue = self.client.get_issue(issue_number)
        title = validate_issue_for_claim(issue, issue_number)
        base_branch = str(base_branch or "").strip()
        if not base_branch or "/" in base_branch or any(character.isspace() for character in base_branch):
            raise ClaimError("Base branch must be a single branch name, such as staging.")
        slug = slugify(title)
        selected_run_path = validate_run_path(
            run_path
            or f"application/runs/{datetime_module.datetime.now(datetime_module.timezone.utc).date().isoformat()}"
            f"-matic-issue-{issue_number}-{slug}"
        )
        self._assert_run_path_available(selected_run_path)
        selected_work_branch = validate_work_branch(
            work_branch or f"matic/issue-{issue_number}-{slug}", issue_number
        )
        self._assert_work_branch_available(selected_work_branch)

        base_reference = self.client.get_ref(f"heads/{base_branch}")
        base_sha = _ref_sha(base_reference)
        base_commit = self.client.get_commit(base_sha)
        generation = 1
        timestamp = self.now()
        record = self._new_record(
            issue_number=issue_number,
            title=title,
            owner_login=self.operator_login,
            execution_id=self.execution_id_factory(),
            generation=generation,
            status="active",
            execution_active=True,
            run_path=selected_run_path,
            work_branch=selected_work_branch,
            base_branch=base_branch,
            base_sha=base_sha,
            claimed_at=timestamp,
            updated_at=timestamp,
            stage=stage,
        )
        latest_issue = self.client.get_issue(issue_number)
        latest_title = validate_issue_for_claim(latest_issue, issue_number)
        if latest_title != title:
            raise ClaimError(
                "The issue title changed while the claim was being prepared; "
                "re-run selection instead of claiming stale scope."
            )
        verified = self._create_initial_ref(
            issue_number,
            record,
            parent_sha=base_sha,
            base_tree_sha=_tree_sha(base_commit),
            conflict_message=f"Another operator claimed issue #{issue_number} first.",
        )
        return self._result("claimed", verified)

    def adopt(
        self,
        issue_number: int,
        run_path: str,
        work_branch: str,
        stage: str,
        reason: str,
        status: str = "active",
        base_branch: str = DEFAULT_BASE_BRANCH,
        pull_request: Optional[Mapping[str, Any]] = None,
    ) -> Dict[str, Any]:
        """Atomically register an existing run during claim rollout."""
        validate_issue_number(issue_number)
        existing = self.read(issue_number)
        if existing is not None:
            raise ClaimConflict(
                f"Issue #{issue_number} is already claimed by "
                f"{existing.data['owner_login']}.",
                existing,
            )
        if not reason.strip():
            raise ClaimError("An adoption reason is required.")
        status = str(status or "").strip().lower()
        if status not in ALLOWED_STATUSES or status == "complete":
            raise ClaimError(
                "An existing run may be adopted only in active, blocked, paused, "
                "awaiting-review, awaiting-merge, ineligible, or released state."
            )
        issue = self.client.get_issue(issue_number)
        title = validate_issue_for_claim(issue, issue_number)
        selected_run_path = validate_run_path(run_path)
        self._assert_run_path_exists(selected_run_path)
        selected_work_branch = validate_work_branch(work_branch, issue_number)
        work_reference = self.client.get_ref_optional(f"heads/{selected_work_branch}")
        if work_reference is None:
            raise ClaimError(
                f"Existing run branch {selected_work_branch} could not be found."
            )
        base_branch = str(base_branch or "").strip()
        if not base_branch or "/" in base_branch or any(character.isspace() for character in base_branch):
            raise ClaimError("Base branch must be a single branch name, such as staging.")
        base_reference = self.client.get_ref(f"heads/{base_branch}")
        base_sha = _ref_sha(base_reference)
        base_commit = self.client.get_commit(base_sha)
        timestamp = self.now()
        execution_active = status not in IDLE_STATUSES
        record = self._new_record(
            issue_number=issue_number,
            title=title,
            owner_login=self.operator_login,
            execution_id=self.execution_id_factory() if execution_active else None,
            generation=1,
            status=status,
            execution_active=execution_active,
            run_path=selected_run_path,
            work_branch=selected_work_branch,
            base_branch=base_branch,
            base_sha=base_sha,
            claimed_at=timestamp,
            updated_at=timestamp,
            stage=stage,
        )
        record["adopted_from_existing_run"] = True
        record["adoption_reason"] = reason.strip()
        record["work_branch_sha"] = _ref_sha(work_reference)
        self._apply_pull_request(record, pull_request)
        latest_issue = self.client.get_issue(issue_number)
        latest_title = validate_issue_for_claim(latest_issue, issue_number)
        if latest_title != title:
            raise ClaimError(
                "The issue title changed while the existing run was being adopted; "
                "inspect the run instead of registering stale scope."
            )
        verified = self._create_initial_ref(
            issue_number,
            record,
            parent_sha=base_sha,
            base_tree_sha=_tree_sha(base_commit),
            conflict_message=f"Another operator registered issue #{issue_number} first.",
        )
        return self._result("adopted", verified)

    def inspect(self, issue_number: int) -> Dict[str, Any]:
        snapshot = self.read(issue_number)
        if snapshot is None:
            return {
                "result": "unclaimed",
                "claim_ref": full_issue_ref(issue_number),
            }
        return self._result("claimed", snapshot)

    def transition(
        self,
        issue_number: int,
        expected_execution_id: str,
        status: str,
        stage: Optional[str] = None,
        reason: str = "",
        pull_request: Optional[Mapping[str, Any]] = None,
    ) -> Dict[str, Any]:
        snapshot = self._required_snapshot(issue_number)
        self._require_active_owner(snapshot, expected_execution_id)
        status = str(status or "").strip().lower()
        if status not in ALLOWED_STATUSES:
            raise ClaimError(
                f"Unsupported claim status {status!r}; use one of "
                f"{', '.join(sorted(ALLOWED_STATUSES))}."
            )
        record = copy.deepcopy(snapshot.data)
        timestamp = self.now()
        record["status"] = status
        record["stage"] = stage or record.get("stage")
        record["updated_at"] = timestamp
        if status in IDLE_STATUSES:
            record["execution_active"] = False
            record["last_execution_id"] = record.get("execution_id")
            record["execution_id"] = None
        else:
            record["execution_active"] = True
        if status == "complete":
            record["completed_at"] = timestamp
        if status in {"ineligible", "released"}:
            record["released_at"] = timestamp
        self._apply_pull_request(record, pull_request)
        record["last_transition"] = _transition_record(
            snapshot.data, record, self.operator_login, reason, timestamp
        )
        return self._update_snapshot(
            issue_number,
            snapshot,
            record,
            self._commit_message(record, f"status {status}"),
        )

    def resume(
        self,
        issue_number: int,
        stage: str,
        reason: str = "",
    ) -> Dict[str, Any]:
        snapshot = self._required_snapshot(issue_number)
        current = snapshot.data
        if current["status"] in TERMINAL_STATUSES:
            raise OwnershipError(
                f"Issue #{issue_number} has terminal claim status {current['status']}; "
                "use the explicit reopen operation for a new run."
            )
        takeover = bool(reason.strip())
        if current["execution_active"] and not takeover:
            raise OwnershipError(
                "The recorded execution is still active. Confirm it has stopped and "
                "provide a takeover reason before resuming."
            )
        if current["owner_login"] != self.operator_login and not takeover:
            raise OwnershipError(
                f"Issue #{issue_number} is reserved for {current['owner_login']}; "
                "use an explicit handoff or takeover reason."
            )
        issue = self.client.get_issue(issue_number)
        validate_issue_for_claim(issue, issue_number)
        timestamp = self.now()
        record = copy.deepcopy(current)
        record["owner_login"] = self.operator_login
        record["execution_id"] = self.execution_id_factory()
        record["execution_active"] = True
        record["status"] = "active"
        record["stage"] = stage
        record["updated_at"] = timestamp
        record["resume_count"] = int(record.get("resume_count", 0)) + 1
        if takeover:
            record["takeover_reason"] = reason.strip()
        record["last_transition"] = _transition_record(
            current, record, self.operator_login, reason, timestamp
        )
        return self._update_snapshot(
            issue_number,
            snapshot,
            record,
            self._commit_message(record, "resume"),
        )

    def handoff(
        self,
        issue_number: int,
        expected_execution_id: str,
        target_operator: str,
        reason: str,
    ) -> Dict[str, Any]:
        snapshot = self._required_snapshot(issue_number)
        self._require_active_owner(snapshot, expected_execution_id)
        target_operator = validate_login(target_operator, "handoff target login")
        if target_operator == self.operator_login:
            raise ClaimError("Handoff target must differ from the current operator.")
        if not reason.strip():
            raise ClaimError("A handoff reason is required.")
        timestamp = self.now()
        record = copy.deepcopy(snapshot.data)
        record["owner_login"] = target_operator
        record["execution_id"] = None
        record["execution_active"] = False
        record["status"] = "paused"
        record["updated_at"] = timestamp
        record["handoff_target"] = target_operator
        record["handoff_reason"] = reason.strip()
        record["last_transition"] = _transition_record(
            snapshot.data, record, self.operator_login, reason.strip(), timestamp
        )
        return self._update_snapshot(
            issue_number,
            snapshot,
            record,
            self._commit_message(record, f"handoff to {target_operator}"),
        )

    def reopen(
        self,
        issue_number: int,
        stage: str,
        reason: str,
        run_path: Optional[str] = None,
        work_branch: Optional[str] = None,
        base_branch: str = DEFAULT_BASE_BRANCH,
    ) -> Dict[str, Any]:
        snapshot = self._required_snapshot(issue_number)
        current = snapshot.data
        if current["status"] not in TERMINAL_STATUSES or current["execution_active"]:
            raise ClaimError(
                "Only an inactive terminal claim can be reopened as a new run."
            )
        if not reason.strip():
            raise ClaimError("A reopen reason is required.")
        issue = self.client.get_issue(issue_number)
        title = validate_issue_for_claim(issue, issue_number)
        base_branch = str(base_branch or "").strip()
        if not base_branch or "/" in base_branch or any(character.isspace() for character in base_branch):
            raise ClaimError("Base branch must be a single branch name, such as staging.")
        base_reference = self.client.get_ref(f"heads/{base_branch}")
        base_sha = _ref_sha(base_reference)
        generation = int(current["generation"]) + 1
        slug = slugify(title)
        selected_run_path = validate_run_path(
            run_path
            or f"application/runs/{datetime_module.datetime.now(datetime_module.timezone.utc).date().isoformat()}"
            f"-matic-issue-{issue_number}-{slug}-g{generation}"
        )
        self._assert_run_path_available(selected_run_path)
        selected_work_branch = validate_work_branch(
            work_branch or f"matic/issue-{issue_number}-{slug}-g{generation}",
            issue_number,
        )
        self._assert_work_branch_available(selected_work_branch)
        latest_issue = self.client.get_issue(issue_number)
        latest_title = validate_issue_for_claim(latest_issue, issue_number)
        if latest_title != title:
            raise ClaimError(
                "The issue title changed while the new generation was being prepared; "
                "re-run selection instead of reopening stale scope."
            )
        timestamp = self.now()
        record = self._new_record(
            issue_number=issue_number,
            title=title,
            owner_login=self.operator_login,
            execution_id=self.execution_id_factory(),
            generation=generation,
            status="active",
            execution_active=True,
            run_path=selected_run_path,
            work_branch=selected_work_branch,
            base_branch=base_branch,
            base_sha=base_sha,
            claimed_at=timestamp,
            updated_at=timestamp,
            stage=stage,
        )
        record["reopened_from_generation"] = current["generation"]
        record["reopened_from_run_path"] = current["run_path"]
        record["reopen_reason"] = reason.strip()
        record["last_transition"] = _transition_record(
            current, record, self.operator_login, reason.strip(), timestamp
        )
        return self._update_snapshot(
            issue_number,
            snapshot,
            record,
            self._commit_message(record, "reopen"),
        )

    def _new_record(
        self,
        issue_number: int,
        title: str,
        owner_login: str,
        execution_id: Optional[str],
        generation: int,
        status: str,
        execution_active: bool,
        run_path: str,
        work_branch: str,
        base_branch: str,
        base_sha: str,
        claimed_at: str,
        updated_at: str,
        stage: str,
    ) -> Dict[str, Any]:
        record: Dict[str, Any] = {
            "schema": CLAIM_SCHEMA,
            "issue_number": issue_number,
            "issue_title": clean_title(title),
            "claim_ref": full_issue_ref(issue_number),
            "owner_login": validate_login(owner_login, "claim owner login"),
            "execution_id": execution_id,
            "execution_active": execution_active,
            "generation": generation,
            "status": status,
            "stage": stage,
            "run_id": _run_id(run_path),
            "run_path": run_path,
            "work_branch": work_branch,
            "base_branch": base_branch,
            "base_sha": base_sha,
            "claimed_at": claimed_at,
            "updated_at": updated_at,
            "last_transition": {
                "at": claimed_at,
                "by": owner_login,
                "from_status": None,
                "to_status": status,
                "from_owner_login": None,
                "to_owner_login": owner_login,
                "from_execution_id": None,
                "to_execution_id": execution_id,
            },
        }
        _validate_claim_record(record, issue_number)
        return record

    def _required_snapshot(self, issue_number: int) -> ClaimSnapshot:
        snapshot = self.read(issue_number)
        if snapshot is None:
            raise ClaimError(f"Issue #{issue_number} has no recorded Matic claim.")
        return snapshot

    def _require_active_owner(
        self, snapshot: ClaimSnapshot, expected_execution_id: str
    ) -> None:
        current = snapshot.data
        if not current["execution_active"]:
            raise OwnershipError("The claim has no active execution token.")
        if current["owner_login"] != self.operator_login:
            raise OwnershipError(
                f"The current claim owner is {current['owner_login']}, not "
                f"{self.operator_login}."
            )
        if not expected_execution_id or expected_execution_id != current.get("execution_id"):
            raise OwnershipError("The execution token is stale or does not match the claim.")

    def _assert_work_branch_available(self, work_branch: str) -> None:
        existing = self.client.get_ref_optional(f"heads/{work_branch}")
        if existing is not None:
            raise ClaimError(
                f"Work branch {work_branch} already exists; inspect its run or PR before proceeding."
            )

    @staticmethod
    def _assert_run_path_available(run_path: str) -> None:
        if Path(run_path).exists():
            raise ClaimError(
                f"Run path {run_path} already exists; inspect its run before proceeding."
            )

    @staticmethod
    def _assert_run_path_exists(run_path: str) -> None:
        path = Path(run_path)
        if not path.exists() or not path.is_dir():
            raise ClaimError(
                f"Existing run path {run_path} is not an available run directory."
            )

    def _create_claim_commit(
        self,
        issue_number: int,
        record: Mapping[str, Any],
        parent_sha: str,
        base_tree_sha: str,
        message: str,
    ) -> str:
        content = json.dumps(record, indent=2, sort_keys=True) + "\n"
        blob_sha = _require_sha(
            self.client.create_blob(content), "the claim record blob"
        )
        tree_sha = _require_sha(
            self.client.create_tree(base_tree_sha, claim_path(issue_number), blob_sha),
            "the claim record tree",
        )
        return _require_sha(
            self.client.create_commit(message, tree_sha, parent_sha),
            "the claim record commit",
        )

    def _create_initial_ref(
        self,
        issue_number: int,
        record: Mapping[str, Any],
        parent_sha: str,
        base_tree_sha: str,
        conflict_message: str,
    ) -> ClaimSnapshot:
        commit_sha = self._create_claim_commit(
            issue_number,
            record,
            parent_sha=parent_sha,
            base_tree_sha=base_tree_sha,
            message=self._commit_message(record, "claim"),
        )
        try:
            response = self.client.create_ref(full_issue_ref(issue_number), commit_sha)
        except GitHubApiError as error:
            winner = self.read(issue_number)
            if winner is not None:
                if winner.head_sha == commit_sha:
                    return winner
                raise ClaimConflict(conflict_message, winner) from error
            if error.status in {409, 422}:
                raise ClaimError(
                    "GitHub rejected the claim ref creation, but its owner could not be read. "
                    "Do not retry until the ref is inspected."
                ) from error
            raise ClaimError(
                "The claim ref creation result is unknown and the ref is not visible. "
                "Inspect GitHub before retrying."
            ) from error
        returned_sha = _ref_sha(response)
        if returned_sha != commit_sha:
            raise ClaimConflict(
                "The claim ref did not resolve to the created claim commit.",
                self.read(issue_number),
            )
        verified = self.read(issue_number)
        if verified is None or verified.head_sha != commit_sha:
            raise ClaimConflict(
                "The created claim could not be verified as the current ref owner.",
                verified,
            )
        return verified

    def _update_snapshot(
        self,
        issue_number: int,
        snapshot: ClaimSnapshot,
        record: Mapping[str, Any],
        message: str,
    ) -> Dict[str, Any]:
        _validate_claim_record(record, issue_number)
        current_commit = self.client.get_commit(snapshot.head_sha)
        commit_sha = self._create_claim_commit(
            issue_number,
            record,
            parent_sha=snapshot.head_sha,
            base_tree_sha=_tree_sha(current_commit),
            message=message,
        )
        try:
            response = self.client.update_ref(issue_ref(issue_number), commit_sha)
        except GitHubApiError as error:
            winner = self.read(issue_number)
            if winner is not None and winner.data.get("last_transition") == record.get(
                "last_transition"
            ):
                return self._result("updated", winner)
            if error.status in {409, 422}:
                raise ClaimConflict(
                    "The claim changed before this update could be applied.", winner
                ) from error
            raise ClaimError(
                "The claim update result is unknown. Inspect the claim before retrying."
            ) from error
        returned_sha = _ref_sha(response)
        if returned_sha != commit_sha:
            raise ClaimConflict(
                "GitHub accepted a different claim ref head than this update created.",
                self.read(issue_number),
            )
        verified = self.read(issue_number)
        if verified is None:
            raise ClaimError("The claim disappeared while verifying its update.")
        if verified.data.get("last_transition") != record.get("last_transition"):
            raise ClaimConflict(
                "A later claim update replaced this state before verification.", verified
            )
        return self._result("updated", verified)

    @staticmethod
    def _commit_message(record: Mapping[str, Any], action: str) -> str:
        title = clean_title(str(record.get("issue_title", "")))
        return f"matic: {action} issue #{record['issue_number']} ({title})"

    @staticmethod
    def _apply_pull_request(
        record: Dict[str, Any], pull_request: Optional[Mapping[str, Any]]
    ) -> None:
        if pull_request is None:
            return
        required = {"number", "title", "url", "head", "base"}
        missing = sorted(field for field in required if not pull_request.get(field))
        if missing:
            raise ClaimError(
                f"Pull request metadata is incomplete; missing {', '.join(missing)}."
            )
        record["pull_request"] = {
            "number": int(pull_request["number"]),
            "title": clean_title(str(pull_request["title"])),
            "url": str(pull_request["url"]),
            "head": str(pull_request["head"]),
            "base": str(pull_request["base"]),
        }

    @staticmethod
    def _result(result: str, snapshot: ClaimSnapshot) -> Dict[str, Any]:
        return {
            "result": result,
            "claim_ref": snapshot.data["claim_ref"],
            "claim_head": snapshot.head_sha,
            "claim": snapshot.data,
        }


def _positive_int(value: str) -> int:
    try:
        parsed = int(value)
    except ValueError as error:
        raise argparse.ArgumentTypeError("must be a positive integer") from error
    if parsed < 1:
        raise argparse.ArgumentTypeError("must be a positive integer")
    return parsed


def _add_issue_argument(parser: argparse.ArgumentParser) -> None:
    parser.add_argument("--issue", required=True, type=_positive_int, dest="issue_number")


def _add_transition_arguments(parser: argparse.ArgumentParser) -> None:
    _add_issue_argument(parser)
    parser.add_argument("--execution-id", required=True)
    parser.add_argument("--status", required=True)
    parser.add_argument("--stage")
    parser.add_argument("--reason", default="")
    parser.add_argument("--pr-number", type=_positive_int)
    parser.add_argument("--pr-title")
    parser.add_argument("--pr-url")
    parser.add_argument("--pr-head")
    parser.add_argument("--pr-base")


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--repo", default=DEFAULT_REPOSITORY, help="owner/name repository")
    subparsers = parser.add_subparsers(dest="command", required=True)

    claim_parser = subparsers.add_parser("claim", help="atomically claim an open Matic issue")
    _add_issue_argument(claim_parser)
    claim_parser.add_argument("--base", default=DEFAULT_BASE_BRANCH, dest="base_branch")
    claim_parser.add_argument("--run-path")
    claim_parser.add_argument("--work-branch")
    claim_parser.add_argument("--stage", default="01-select")

    adopt_parser = subparsers.add_parser(
        "adopt", help="atomically register an existing run during claim rollout"
    )
    _add_issue_argument(adopt_parser)
    adopt_parser.add_argument("--run-path", required=True)
    adopt_parser.add_argument("--work-branch", required=True)
    adopt_parser.add_argument("--stage", required=True)
    adopt_parser.add_argument("--status", default="active")
    adopt_parser.add_argument("--base", default=DEFAULT_BASE_BRANCH, dest="base_branch")
    adopt_parser.add_argument("--reason", required=True)
    adopt_parser.add_argument("--pr-number", type=_positive_int)
    adopt_parser.add_argument("--pr-title")
    adopt_parser.add_argument("--pr-url")
    adopt_parser.add_argument("--pr-head")
    adopt_parser.add_argument("--pr-base")

    inspect_parser = subparsers.add_parser("inspect", help="read the current claim")
    _add_issue_argument(inspect_parser)

    transition_parser = subparsers.add_parser(
        "transition", help="append a state transition using an execution token"
    )
    _add_transition_arguments(transition_parser)

    resume_parser = subparsers.add_parser(
        "resume", help="atomically acquire a new execution for an existing run"
    )
    _add_issue_argument(resume_parser)
    resume_parser.add_argument("--stage", required=True)
    resume_parser.add_argument(
        "--reason",
        default="",
        help="required when taking over an active execution or another operator",
    )

    handoff_parser = subparsers.add_parser(
        "handoff", help="stop the current execution and reserve the run for another operator"
    )
    _add_issue_argument(handoff_parser)
    handoff_parser.add_argument("--execution-id", required=True)
    handoff_parser.add_argument("--to-operator", required=True)
    handoff_parser.add_argument("--reason", required=True)

    reopen_parser = subparsers.add_parser(
        "reopen", help="start an explicit new generation after a terminal claim"
    )
    _add_issue_argument(reopen_parser)
    reopen_parser.add_argument("--stage", required=True)
    reopen_parser.add_argument("--reason", required=True)
    reopen_parser.add_argument("--base", default=DEFAULT_BASE_BRANCH, dest="base_branch")
    reopen_parser.add_argument("--run-path")
    reopen_parser.add_argument("--work-branch")

    return parser


def _pull_request_arguments(args: argparse.Namespace) -> Optional[Dict[str, Any]]:
    values = {
        "number": args.pr_number,
        "title": args.pr_title,
        "url": args.pr_url,
        "head": args.pr_head,
        "base": args.pr_base,
    }
    if not any(value is not None for value in values.values()):
        return None
    return values


def run_cli(args: argparse.Namespace) -> Dict[str, Any]:
    client = GitHubClient(args.repo)
    if args.command == "inspect":
        manager = ClaimManager(client, operator_login="inspect")
        return manager.inspect(args.issue_number)

    operator_login = client.current_user()
    manager = ClaimManager(client, operator_login=operator_login)
    if args.command == "claim":
        return manager.claim(
            args.issue_number,
            base_branch=args.base_branch,
            run_path=args.run_path,
            work_branch=args.work_branch,
            stage=args.stage,
        )
    if args.command == "adopt":
        return manager.adopt(
            args.issue_number,
            run_path=args.run_path,
            work_branch=args.work_branch,
            stage=args.stage,
            reason=args.reason,
            status=args.status,
            base_branch=args.base_branch,
            pull_request=_pull_request_arguments(args),
        )
    if args.command == "transition":
        return manager.transition(
            args.issue_number,
            expected_execution_id=args.execution_id,
            status=args.status,
            stage=args.stage,
            reason=args.reason,
            pull_request=_pull_request_arguments(args),
        )
    if args.command == "resume":
        return manager.resume(args.issue_number, stage=args.stage, reason=args.reason)
    if args.command == "handoff":
        return manager.handoff(
            args.issue_number,
            expected_execution_id=args.execution_id,
            target_operator=args.to_operator,
            reason=args.reason,
        )
    if args.command == "reopen":
        return manager.reopen(
            args.issue_number,
            stage=args.stage,
            reason=args.reason,
            run_path=args.run_path,
            work_branch=args.work_branch,
            base_branch=args.base_branch,
        )
    raise ClaimError(f"Unsupported command: {args.command}")


def main(argv: Optional[Sequence[str]] = None) -> int:
    parser = build_parser()
    args = parser.parse_args(argv)
    try:
        result = run_cli(args)
    except ClaimConflict as error:
        result = {"result": "contention", "error": str(error), "code": error.code}
        if error.existing is not None:
            result.update(
                {
                    "claim_ref": error.existing.data["claim_ref"],
                    "claim_head": error.existing.head_sha,
                    "claim": error.existing.data,
                }
            )
        print(json.dumps(result, indent=2, sort_keys=True))
        return CONTENTION_EXIT_CODE
    except ClaimError as error:
        print(
            json.dumps(
                {"result": "error", "error": str(error), "code": error.code},
                indent=2,
                sort_keys=True,
            )
        )
        return ERROR_EXIT_CODE
    print(json.dumps(result, indent=2, sort_keys=True))
    return 0


if __name__ == "__main__":
    sys.exit(main())
