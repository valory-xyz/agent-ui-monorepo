/**
 * Shapes mirror pearl-connect's API (PR #7/#8 stack):
 * - GET /settings returns the canonical nested shape.
 * - PATCH /settings is a JSON merge-patch; the keystore password gates the
 *   `protected` object (mode/whitelist), while `harness` needs no password.
 * - POST /session opens a Claude Code session on demand; a deep link that
 *   won't open is a 200 with {launched: false, error} for the UI to show.
 */

export type TransactionMode = 'restricted' | 'unrestricted';

/** Which Claude Code the server opens the workspace session in. */
export type Harness = 'claude_code_cli' | 'claude_code_desktop';

/** chain -> addresses the service safe may call in restricted mode */
export type Whitelist = Record<string, string[]>;

/** The integrity-checked guardrail state. */
export type ProtectedSettings = {
  mode: TransactionMode;
  whitelist: Whitelist;
};

export type ConnectSettings = {
  protected: ProtectedSettings;
  harness: Harness;
};

/**
 * Merge-patch body: omitted fields keep their current values. The whitelist
 * is deliberately absent — the server rejects any whitelist patch with
 * 422 WHITELIST_FROZEN (read-only via the API for now).
 */
export type SettingsPatch = {
  /** Required iff `protected` is present. */
  password?: string;
  protected?: {
    mode?: TransactionMode;
  };
  harness?: Harness;
};

export type SessionResponse = {
  launched: boolean;
  harness: Harness;
  error?: string;
};
