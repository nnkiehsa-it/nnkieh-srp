# Contributing / 貢獻

## 繁體中文

感謝你參與 Novae。送出 issue 或 pull request 前，請閱讀完整的[繁中貢獻指南](https://tavricccc.github.io/novae-website/docs/contributing.html)，其中包含環境建立、測試、安全回報、文件同步與 review 要求。

- 一般前端／重構：`npm run verify:local`
- 後端 action、權限、RPC、RLS、migration、Edge 或 worker：`npm run verify:integration`
- 大型變更／合併前：`npm run verify:all`

Windows 直接執行 npm 指令；整合驗證會自動使用 WSL。新增 action 或權限時必須同步補成功與拒絕案例，PR CI 與後端部署都會執行完整本地 Supabase 驗證。

## English

Thank you for contributing to Novae. Before opening an issue or pull request, read the complete [English contributing guide](https://tavricccc.github.io/novae-website/docs/en/contributing.html) for setup, verification, security reporting, documentation synchronization, and review expectations.

- Frontend and ordinary refactors: `npm run verify:local`
- Backend actions, permissions, RPCs, RLS, migrations, Edge, or workers: `npm run verify:integration`
- Large changes and pre-merge handoff: `npm run verify:all`

On Windows, run the npm command normally; integration verification enters WSL automatically. New actions and permissions require asserted success and denial cases. PR CI and backend deployment run the full local Supabase suite.

All participation is subject to the [Code of Conduct](CODE_OF_CONDUCT.md). Contributions are submitted under the repository's [MIT License](LICENSE).
