import { Section } from '../../ui/Section';

// The whitelist itself is BE-owned and deliberately not rendered — the
// section only explains that restricted mode limits the agent to allowed
// addresses. Re-introduce a list (with backend-provided friendly names)
// if/when whitelist editing is added.
export const WhitelistedAddresses = () => (
  <Section
    title="Whitelisted addresses"
    description="Specifies allowed web3 addresses your agent can interact with."
  />
);
