---
lorespec: "0.1"
id: "2026091401"
date: "2026-09-14"
source: "claude"
topic: "Production 500 error investigation - wrong initial hypothesis, correct root cause was DB network failure from VM migration"
tags: [production, debugging, infrastructure, networking, docker, mariadb, proxmox, cloud-init]
classification:
  type: technical
  secondary_type: operational
  domains: [infrastructure, networking, devops]
  value: high
trails: [lead-lab-production, infrastructure-debugging]
---

## Session Arc

### Started
GitHub issue #47 reported production site at leadhub.adventist.asia returning HTTP 500 on page /. The issue included a screenshot showing Laravel's default "500 | Server Error" page.

### Pivots
- **Initial wrong hypothesis**: Analysis of the codebase suggested Inertia v3 SSR was enabled (`config/inertia.php:19`) but no SSR server was running. This was a plausible code-level explanation but was proven wrong by production logs.
- **Real root cause discovery**: SSH into production server revealed the actual error was `PDOException: SQLSTATE[HY000] [2002] No route to host` when connecting to the database at `10.224.188.108:3307`. The MariaDB container had crashed 27 hours earlier.
- **VM migration context**: User provided context that VMs were migrated from lost01 to lost03 last Friday. Sysadmin handoff brief revealed cloud-init had `/32` netmask instead of `/24`, causing the network failure.

### Ended
MariaDB container restored, issue #47 closed with resolution comment. Network persistence issue tracked in new issue #50.

## Insights

### I1: SSR hypothesis was wrong
- **Insight**: The Inertia v3 SSR configuration (`enabled: true` with no SSR server) was a red herring. The real failure was database connectivity.
- **Evidence**: Production logs showed `PDOException: No route to host` at session middleware, not SSR-related errors.
- **Source**: SSH investigation of production container logs on 10.224.188.109
- **Confidence**: high

### I2: VM migration caused network failure
- **Insight**: Cloud-init `ipconfig0` had `ip=10.224.188.108/32` instead of `/24`. The `/32` mask means single-host routing with no subnet - the VM couldn't communicate with other devices on the same LAN segment.
- **Evidence**: Sysadmin handoff brief from TKT-080/TKT-081, `ip addr show ens18` on VMID 1008 showed the issue.
- **Source**: Paseo session 523502fd-b10a-45e1-bc1b-6936282eecdd, production investigation
- **Confidence**: high

### I3: Cloud-init not managing network on VMID 1008
- **Insight**: The VM's cloud-init `network-config.json` and `user-data.txt` are both empty. The `ipconfig0` setting on Proxmox side won't be applied inside the guest.
- **Evidence**: `cat /var/lib/cloud/instance/network-config.json` returned empty, datasource is NoCloud (seed from /dev/sr0).
- **Source**: SSH investigation of 10.224.188.108
- **Confidence**: high

### I4: Network fix is non-persistent
- **Insight**: The temporary fix (`ip addr add 10.224.188.108/24 dev ens18`) is in-memory only. No netplan, no `/etc/network/interfaces`, no systemd-networkd `.network` file exists. A reboot will drop the IP and cause the same outage.
- **Evidence**: `ls /etc/netplan/` empty, `cat /etc/network/interfaces` not found, `networkctl status ens18` shows "unmanaged".
- **Source**: SSH investigation of 10.224.188.108
- **Confidence**: high

## Patterns

### P1: Infrastructure root cause vs code root cause
- **Pattern**: When investigating production errors, infrastructure issues (network, database, disk) should be ruled out before code issues. The 500 error appeared to be a code issue but was actually a database connectivity problem.
- **Scope**: universal - applies to any web application investigation
- **Source**: This session - initial wrong hypothesis about SSR

### P2: VM migration network verification checklist
- **Pattern**: After VM migration, verify: (1) network interface has correct IP and netmask, (2) default route exists, (3) critical services are bound to correct ports, (4) database containers are running and healthy.
- **Scope**: local - specific to Proxmox VM migrations
- **Source**: Sysadmin handoff brief from 2026-09-13

## Solutions

### S1: MariaDB container restoration
- **Problem**: MariaDB container on VMID 1008 (10.224.188.108) crashed with exit code 255 because Docker couldn't bind port 3307 to the host IP during/after network disruption.
- **Fix**: `docker compose down` then `docker compose up -d` from `/opt/yard/mariadb/`
- **Why it works**: Container was stopped but data volume intact. Recreating it restores port binding and service.
- **Caveats**: Network fix is non-persistent. Reboot will cause same outage until netplan is configured.

### S2: Temporary network fix
- **Problem**: VMID 1008 had no IP on ens18 after migration.
- **Fix**: `ip link set ens18 up && ip addr add 10.224.188.108/24 dev ens18 && ip route add default via 10.224.188.254` via `qm guest exec`
- **Why it works**: Manually assigns the IP with correct /24 mask and default route.
- **Caveats**: Non-persistent. Needs netplan config for permanent fix.

## Connections

- I1 —[contradicts]→ S1 (SSR hypothesis was wrong, DB connectivity was the real issue)
- I2 —[led_to]→ S1 (VM migration caused network failure which caused DB crash)
- I2 —[led_to]→ I4 (migration revealed non-persistent network config)
- I3 —[informs]→ I4 (cloud-init not managing network means Proxmox fix won't work)
- S1 —[resolved]→ issue #47
- I4 —[created]→ issue #50

## Artifacts

### A1: Issue #47 comment
- **Type**: GitHub comment
- **Content**: Resolution documentation including root cause, investigation steps, and follow-up
- **Status**: Posted, issue closed

### A2: Issue #50
- **Type**: GitHub issue
- **Title**: "infra: VMID 1008 (cistern) network config non-persistent - will lose DB connectivity on reboot"
- **Content**: Netplan fix recommendation with YAML config
- **Status**: Open

## Trail Updates

### lead-lab-production
- Extended with production 500 error resolution
- Key finding: infrastructure issue, not code issue

### infrastructure-debugging
- New trail started
- Pattern: rule out infrastructure before code
- Pattern: VM migration verification checklist

## Next Steps

### N1: Apply netplan config on VMID 1008
- **Priority**: High
- **What**: Create `/etc/netplan/01-static.yaml` with correct `/24` address and apply
- **Why**: Current network fix is non-persistent, reboot will cause same outage
- **Blocks**: Production stability

### N2: Audit cloud-init masks on other VMs
- **Priority**: Low
- **What**: Check if other VMs have `/32` masks in `ipconfig0` that should be `/24`
- **Why**: Prevent same issue on other VMs
