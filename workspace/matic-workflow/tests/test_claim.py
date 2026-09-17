import base64
import json
import subprocess
import sys
import threading
import unittest
from pathlib import Path
from unittest.mock import patch


SCRIPT_DIRECTORY = Path(__file__).resolve().parents[1] / "scripts"
sys.path.insert(0, str(SCRIPT_DIRECTORY))

from claim import (  # noqa: E402
    ClaimError,
    ClaimConflict,
    GitHubClient,
    ClaimManager,
    GitHubApiError,
    OwnershipError,
    issue_ref,
    validate_run_path,
)


class MemoryGitHub:
    """A small GitHub Git-data API model for concurrency tests."""

    def __init__(self):
        self.issues = {
            7: {
                "number": 7,
                "title": "Add a safe report filter",
                "state": "open",
                "labels": [{"name": "matic"}],
            }
        }
        self.refs = {
            "heads/staging": {
                "ref": "refs/heads/staging",
                "object": {"type": "commit", "sha": "base-1"},
            }
        }
        self.commits = {"base-1": {"tree": {"sha": "tree-1"}, "parents": []}}
        self.trees = {"tree-1": {"tree": []}}
        self.blobs = {}
        self.sequence = 1
        self.lock = threading.Lock()

    def get_issue(self, issue_number):
        return self.issues[issue_number]

    def get_ref(self, ref_name):
        if ref_name not in self.refs:
            raise GitHubApiError(f"missing {ref_name}", status=404)
        return self.refs[ref_name]

    def get_ref_optional(self, ref_name):
        try:
            return self.get_ref(ref_name)
        except GitHubApiError as error:
            if error.status == 404:
                return None
            raise

    def get_commit(self, sha):
        return self.commits[sha]

    def get_tree(self, sha):
        return self.trees[sha]

    def get_blob(self, sha):
        return self.blobs[sha]

    def create_blob(self, content):
        sha = f"blob-{self.sequence}"
        self.sequence += 1
        self.blobs[sha] = {
            "encoding": "base64",
            "content": base64.b64encode(content.encode("utf-8")).decode("ascii"),
        }
        return sha

    def create_tree(self, base_tree, path, blob_sha):
        sha = f"tree-{self.sequence}"
        self.sequence += 1
        entries = [entry.copy() for entry in self.trees[base_tree]["tree"]]
        entries = [entry for entry in entries if entry["path"] != path]
        entries.append({"path": path, "type": "blob", "sha": blob_sha})
        self.trees[sha] = {"tree": entries}
        return sha

    def create_commit(self, message, tree_sha, parent_sha):
        sha = f"commit-{self.sequence}"
        self.sequence += 1
        self.commits[sha] = {
            "message": message,
            "tree": {"sha": tree_sha},
            "parents": [{"sha": parent_sha}],
        }
        return sha

    def create_ref(self, full_ref, sha):
        ref_name = full_ref.removeprefix("refs/")
        with self.lock:
            if ref_name in self.refs:
                raise GitHubApiError("Reference already exists (HTTP 422)", status=422)
            self.refs[ref_name] = {
                "ref": full_ref,
                "object": {"type": "commit", "sha": sha},
            }
        return self.refs[ref_name]

    def update_ref(self, ref_name, sha):
        with self.lock:
            current = self.refs[ref_name]["object"]["sha"]
            parent = self.commits[sha]["parents"][0]["sha"]
            if current != parent:
                raise GitHubApiError("Reference is not a fast-forward (HTTP 422)", status=422)
            self.refs[ref_name] = {
                "ref": f"refs/{ref_name}",
                "object": {"type": "commit", "sha": sha},
            }
            return self.refs[ref_name]


class SimultaneousClaimGitHub(MemoryGitHub):
    def __init__(self):
        super().__init__()
        self.first_claim_reads = 0
        self.claim_read_barrier = threading.Barrier(2)

    def get_ref_optional(self, ref_name):
        if ref_name == issue_ref(7) and self.first_claim_reads < 2:
            with self.lock:
                self.first_claim_reads += 1
            self.claim_read_barrier.wait(timeout=5)
            return None
        return super().get_ref_optional(ref_name)


class SimultaneousUpdateGitHub(MemoryGitHub):
    def __init__(self):
        super().__init__()
        self.update_calls = 0
        self.update_barrier = threading.Barrier(2)

    def update_ref(self, ref_name, sha):
        with self.lock:
            self.update_calls += 1
        self.update_barrier.wait(timeout=5)
        return super().update_ref(ref_name, sha)


class TimeoutAfterCreateGitHub(MemoryGitHub):
    def create_ref(self, full_ref, sha):
        response = super().create_ref(full_ref, sha)
        raise GitHubApiError("network timeout after the ref was created")


def fixed_clock():
    return "2026-09-17T12:00:00Z"


class ClaimTests(unittest.TestCase):
    def manager(self, client, login, execution_ids):
        return ClaimManager(
            client,
            login,
            now=fixed_clock,
            execution_id_factory=iter(execution_ids).__next__,
        )

    def test_run_paths_must_be_repository_relative_application_runs_paths(self):
        with self.assertRaises(ClaimError):
            validate_run_path("/tmp/other-run")

        self.assertEqual(
            validate_run_path("application/runs/example/"),
            "application/runs/example",
        )

    def test_simultaneous_claims_have_one_winner(self):
        client = SimultaneousClaimGitHub()
        managers = [
            self.manager(client, "operator-a", ["execution-a"]),
            self.manager(client, "operator-b", ["execution-b"]),
        ]
        results = []
        errors = []

        def run(manager):
            try:
                results.append(manager.claim(7))
            except Exception as error:  # capture both thread outcomes for assertions
                errors.append(error)

        threads = [threading.Thread(target=run, args=(manager,)) for manager in managers]
        for thread in threads:
            thread.start()
        for thread in threads:
            thread.join(timeout=5)

        self.assertFalse(any(thread.is_alive() for thread in threads))
        self.assertEqual(len(results), 1)
        self.assertEqual(len(errors), 1)
        self.assertIsInstance(errors[0], ClaimConflict)
        self.assertEqual(errors[0].existing.data["owner_login"], results[0]["claim"]["owner_login"])

    def test_different_issues_can_be_claimed_independently(self):
        client = MemoryGitHub()
        client.issues[8] = {
            "number": 8,
            "title": "Add a safe report export",
            "state": "open",
            "labels": [{"name": "matic"}],
        }
        first = self.manager(client, "operator-a", ["execution-a"])
        second = self.manager(client, "operator-b", ["execution-b"])

        first_result = first.claim(7)
        second_result = second.claim(8)

        self.assertEqual(first_result["result"], "claimed")
        self.assertEqual(second_result["result"], "claimed")
        self.assertIn("heads/matic-claims/issue-7", client.refs)
        self.assertIn("heads/matic-claims/issue-8", client.refs)

    def test_claim_creation_timeout_is_recovered_by_readback(self):
        client = TimeoutAfterCreateGitHub()
        manager = self.manager(client, "operator-a", ["execution-a"])

        result = manager.claim(7)

        self.assertEqual(result["result"], "claimed")
        self.assertEqual(result["claim"]["execution_id"], "execution-a")

    @patch("claim.subprocess.run")
    def test_github_ref_updates_are_non_force(self, run):
        run.return_value = subprocess.CompletedProcess(
            [],
            0,
            stdout=json.dumps(
                {"object": {"type": "commit", "sha": "new-head"}}
            ),
            stderr="",
        )
        GitHubClient("example/project").update_ref(
            "heads/matic-claims/issue-7", "new-head"
        )

        command = run.call_args.args[0]
        payload = json.loads(run.call_args.kwargs["input"])
        self.assertEqual(command[:3], ["gh", "api", "repos/example/project/git/refs/heads/matic-claims/issue-7"])
        self.assertIn("--method", command)
        self.assertIn("PATCH", command)
        self.assertFalse(payload["force"])

    def test_existing_run_can_be_adopted_without_overwriting_it(self):
        client = MemoryGitHub()
        client.refs["heads/matic/issue-7-existing-run"] = {
            "ref": "refs/heads/matic/issue-7-existing-run",
            "object": {"type": "commit", "sha": "base-1"},
        }
        manager = self.manager(client, "operator-a", ["execution-a"])

        adopted = manager.adopt(
            7,
            run_path="application/runs/2026-09-14-matic-issue-36-lower-password-requirements",
            work_branch="matic/issue-7-existing-run",
            stage="05-publish",
            status="awaiting-review",
            reason="Existing run and PR ownership were confirmed during rollout.",
            pull_request={
                "number": 17,
                "title": "Add a safe report filter",
                "url": "https://github.com/example/project/pull/17",
                "head": "matic/issue-7-existing-run",
                "base": "staging",
            },
        )

        self.assertEqual(adopted["result"], "adopted")
        self.assertEqual(adopted["claim"]["status"], "awaiting-review")
        self.assertFalse(adopted["claim"]["execution_active"])
        self.assertIsNone(adopted["claim"]["execution_id"])
        self.assertEqual(adopted["claim"]["pull_request"]["number"], 17)
        self.assertTrue(adopted["claim"]["adopted_from_existing_run"])

    def test_competing_updates_use_fast_forward_cas(self):
        client = SimultaneousUpdateGitHub()
        first = self.manager(client, "operator-a", ["execution-a"])
        claim_result = first.claim(7)
        execution_id = claim_result["claim"]["execution_id"]
        managers = [
            self.manager(client, "operator-a", ["unused-a"]),
            self.manager(client, "operator-a", ["unused-b"]),
        ]
        results = []
        errors = []

        def run(manager, reason):
            try:
                results.append(
                    manager.transition(
                        7,
                        expected_execution_id=execution_id,
                        status="active",
                        stage="02-design",
                        reason=reason,
                    )
                )
            except Exception as error:  # capture both thread outcomes for assertions
                errors.append(error)

        threads = [
            threading.Thread(target=run, args=(managers[0], "first")),
            threading.Thread(target=run, args=(managers[1], "second")),
        ]
        for thread in threads:
            thread.start()
        for thread in threads:
            thread.join(timeout=5)

        self.assertFalse(any(thread.is_alive() for thread in threads))
        self.assertEqual(len(results), 1)
        self.assertEqual(len(errors), 1)
        self.assertIsInstance(errors[0], ClaimConflict)
        self.assertEqual(client.update_calls, 2)

    def test_waiting_transition_invalidates_old_execution(self):
        client = MemoryGitHub()
        manager = self.manager(client, "operator-a", ["execution-a", "execution-b"])
        claim_result = manager.claim(7)
        first_execution = claim_result["claim"]["execution_id"]

        waiting = manager.transition(
            7,
            expected_execution_id=first_execution,
            status="awaiting-review",
            stage="05-publish",
        )
        self.assertFalse(waiting["claim"]["execution_active"])
        self.assertIsNone(waiting["claim"]["execution_id"])

        with self.assertRaises(OwnershipError):
            manager.transition(
                7,
                expected_execution_id=first_execution,
                status="active",
                stage="05-publish",
            )

        resumed = manager.resume(7, stage="06-close-merged")
        self.assertEqual(resumed["claim"]["execution_id"], "execution-b")
        self.assertTrue(resumed["claim"]["execution_active"])

    def test_active_execution_requires_explicit_takeover_reason(self):
        client = MemoryGitHub()
        owner = self.manager(client, "operator-a", ["execution-a"])
        owner.claim(7)
        other = self.manager(client, "operator-b", ["execution-b"])

        with self.assertRaises(OwnershipError):
            other.resume(7, stage="01-select")

        resumed = other.resume(
            7,
            stage="01-select",
            reason="Operator A was confirmed stopped before recovery.",
        )
        self.assertEqual(resumed["claim"]["owner_login"], "operator-b")
        self.assertEqual(resumed["claim"]["execution_id"], "execution-b")
        self.assertEqual(
            resumed["claim"]["takeover_reason"],
            "Operator A was confirmed stopped before recovery.",
        )

    def test_handoff_invalidates_old_owner_and_allows_target_resume(self):
        client = MemoryGitHub()
        owner = self.manager(client, "operator-a", ["execution-a"])
        claim_result = owner.claim(7)
        execution_id = claim_result["claim"]["execution_id"]
        handed_off = owner.handoff(
            7,
            expected_execution_id=execution_id,
            target_operator="operator-b",
            reason="Operator B will finish the review route.",
        )
        self.assertEqual(handed_off["claim"]["owner_login"], "operator-b")
        self.assertFalse(handed_off["claim"]["execution_active"])

        with self.assertRaises(OwnershipError):
            owner.transition(7, execution_id, "active", stage="03-build")

        target = self.manager(client, "operator-b", ["execution-b"])
        resumed = target.resume(7, stage="03-build")
        self.assertEqual(resumed["claim"]["owner_login"], "operator-b")
        self.assertEqual(resumed["claim"]["execution_id"], "execution-b")

    def test_terminal_claim_requires_explicit_reopen(self):
        client = MemoryGitHub()
        manager = self.manager(client, "operator-a", ["execution-a", "execution-b"])
        claim_result = manager.claim(7)
        execution_id = claim_result["claim"]["execution_id"]
        manager.transition(7, execution_id, "complete", stage="06-close-merged")

        with self.assertRaises(OwnershipError):
            manager.resume(7, stage="01-select")

        reopened = manager.reopen(
            7,
            stage="01-select",
            reason="The issue was explicitly reopened for a new outcome.",
        )
        self.assertEqual(reopened["claim"]["generation"], 2)
        self.assertEqual(reopened["claim"]["execution_id"], "execution-b")
        self.assertEqual(
            reopened["claim"]["reopened_from_run_path"],
            claim_result["claim"]["run_path"],
        )
        self.assertEqual(reopened["claim"]["work_branch"], "matic/issue-7-add-a-safe-report-filter-g2")


if __name__ == "__main__":
    unittest.main()
