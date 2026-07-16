# Local integration verifier

The suite rebuilds an isolated local Supabase stack and never writes to the
configured remote project.

## Commands

| Change | Command |
| --- | --- | --- |
| Frontend / ordinary refactor | `npm run verify:local` |
| Migration, RPC, RLS, permission, Edge action or worker | `npm run verify:integration` |
| Large change / before merge | `npm run verify:all` |

PR CI runs both suites.

## Environment

On Windows, run the npm command normally; it enters WSL automatically. WSL 2,
Docker, Supabase CLI and Deno must be available. To use a distro other than
Debian:

```powershell
$env:NOVAE_WSL_DISTRO = 'Ubuntu'
```

`.env.local` is optional and gitignored. The suite has safe local defaults and
always replaces Supabase credentials with the local stack. Use `--keep-running`
to retain containers after a run.

New actions must include asserted positive and denial cases. The coverage guard
fails when a registered action is not referenced. Full maintenance rules:
[official contributing guide](https://tavricccc.github.io/novae-website/docs/contributing.html).
