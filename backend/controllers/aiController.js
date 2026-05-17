/**
 * Smart local AI suggestion engine.
 * Analyses the task title to produce professional Jira-style descriptions
 * without any external API — no rate limits, always instant.
 */

/* ── Keyword maps ── */
const DOMAIN_MAP = [
  { keys: ['login','auth','password','jwt','token','session','signup','register','oauth'], domain: 'Authentication', label: 'Auth',     epic: 'Security'  },
  { keys: ['ui','design','layout','style','css','theme','responsive','modal','sidebar','navbar','button','icon','color','font'], domain: 'UI/UX', label: 'Frontend', epic: 'Design'    },
  { keys: ['api','endpoint','route','rest','graphql','request','response','payload','http'], domain: 'API',  label: 'Backend',  epic: 'Backend'   },
  { keys: ['database','db','mongo','schema','model','migration','query','index','collection'], domain: 'Database', label: 'Backend', epic: 'Backend'   },
  { keys: ['dashboard','chart','graph','metric','stat','report','analytics','widget'],         domain: 'Analytics',label: 'Frontend', epic: 'Analytics' },
  { keys: ['test','spec','unit','e2e','integration','coverage','jest','cypress'],              domain: 'Testing',  label: 'Testing',  epic: 'QA'        },
  { keys: ['deploy','docker','ci','cd','pipeline','kubernetes','aws','server','nginx','env'],  domain: 'DevOps',   label: 'DevOps',   epic: 'DevOps'    },
  { keys: ['notification','email','sms','alert','push','webhook'],                             domain: 'Notifications', label: 'Backend', epic: 'Comms'  },
  { keys: ['search','filter','sort','pagination','infinite','scroll'],                         domain: 'Search & Filtering', label: 'Frontend', epic: 'UX' },
  { keys: ['performance','speed','cache','optimize','lazy','bundle','memory','load'],          domain: 'Performance', label: 'DevOps', epic: 'Performance'},
];

const ACTION_MAP = [
  { keys: ['fix','bug','error','issue','crash','broken','fail','resolve','patch'],   action: 'fix',      priority: 'Most Important', points: 3 },
  { keys: ['add','create','build','implement','develop','make','new','introduce'],   action: 'build',    priority: 'Important',      points: 5 },
  { keys: ['update','improve','enhance','upgrade','refactor','migrate','change'],    action: 'improve',  priority: 'Important',      points: 3 },
  { keys: ['design','redesign','revamp','restyle','rebrand','layout'],               action: 'design',   priority: 'Important',      points: 3 },
  { keys: ['remove','delete','deprecate','clean','cleanup','prune'],                 action: 'remove',   priority: 'Least Important',points: 2 },
  { keys: ['test','spec','cover','verify','validate','check'],                       action: 'test',     priority: 'Least Important',points: 2 },
  { keys: ['integrate','connect','sync','link','merge','import'],                    action: 'integrate',priority: 'Important',      points: 5 },
  { keys: ['configure','setup','install','initialise','initialize','scaffold'],      action: 'setup',    priority: 'Important',      points: 3 },
];

const USER_STORY_MAP = {
  fix:       (f) => `As a user, I want the ${f} to work correctly so that I am not disrupted by errors during my workflow.`,
  build:     (f) => `As a user, I want to be able to ${f} so that I can improve my productivity and experience with the application.`,
  improve:   (f) => `As a user, I want the ${f} to be improved so that my interaction is smoother and more efficient.`,
  design:    (f) => `As a user, I want a well-designed ${f} so that the interface feels intuitive and professional.`,
  remove:    (f) => `As a developer, I want to remove ${f} so that the codebase stays clean and maintainable.`,
  test:      (f) => `As a developer, I want test coverage for ${f} so that future changes are protected from regressions.`,
  integrate: (f) => `As a user, I want ${f} integrated so that I can benefit from connected functionality without switching tools.`,
  setup:     (f) => `As a developer, I want ${f} properly configured so that the environment is consistent and ready for development.`,
};

const ACCEPTANCE_MAP = {
  fix:       ['The bug/error no longer reproduces in any tested scenario', 'Edge cases and error states are handled gracefully', 'Existing tests still pass after the fix', 'No regression is introduced in related features'],
  build:     ['Feature is fully functional and matches the acceptance requirements', 'UI is responsive and accessible on all screen sizes', 'Success and error states are handled with clear user feedback', 'Feature is covered by at least unit-level tests'],
  improve:   ['Performance or UX metric is measurably better than before', 'No existing functionality is broken by the change', 'Code is clean, follows project conventions, and is reviewed', 'Change is backward-compatible or a migration path is provided'],
  design:    ['Design matches approved mockups or style guide', 'Component is responsive across mobile, tablet, and desktop', 'Accessibility (WCAG AA) standards are met', 'Design is consistent with the rest of the application'],
  remove:    ['Removed code/feature is not referenced anywhere in the codebase', 'No runtime errors occur after removal', 'Related documentation and tests are updated accordingly'],
  test:      ['Tests cover all major happy paths and edge cases', 'Test coverage increases by the agreed threshold', 'Tests run in CI/CD without flakiness', 'Test descriptions are clear and meaningful'],
  integrate: ['Integration is fully functional end-to-end', 'Error handling and retry logic are in place', 'Sensitive credentials are stored securely (env vars)', 'Integration is covered by at least integration-level tests'],
  setup:     ['Configuration works across all environments (dev, staging, prod)', 'Setup is documented in README or runbook', 'No hardcoded secrets or environment-specific values in code'],
};

const TECH_NOTES_MAP = {
  fix:       ['Reproduce issue locally and add a regression test before patching', 'Review related code paths to identify root cause', 'Check error logs and monitoring dashboards for impact scope'],
  build:     ['Break the feature into sub-tasks if it spans multiple layers', 'Follow component-driven development — build bottom-up', 'Ensure API contracts are defined and agreed before implementation'],
  improve:   ['Profile before and after the change to quantify improvement', 'Keep changes minimal and focused — avoid scope creep', 'Peer-review required before merge due to potential side effects'],
  design:    ['Use design tokens / CSS variables from the existing design system', 'Test across Chrome, Firefox, and Safari', 'Provide a Figma/Storybook reference if applicable'],
  remove:    ['Search entire codebase for all usages before deleting', 'Deprecate with a warning in the current release if used externally', 'Update CHANGELOG and relevant documentation'],
  test:      ['Use the project\'s standard test runner (Jest / Cypress)', 'Mock external dependencies and side effects', 'Run full test suite locally before submitting PR'],
  integrate: ['Use official SDK or documented REST API — avoid scraping', 'Store API keys only in environment variables, never in code', 'Implement webhook or polling strategy based on latency requirements'],
  setup:     ['Document all required environment variables in .env.example', 'Validate that setup works on a clean machine', 'Add health-check or smoke test to verify setup is correct'],
};

function detectContext(title) {
  const lower = title.toLowerCase();
  const words = lower.split(/\s+/);

  let actionKey = 'build';
  let actionPriority = 'Important';
  let actionPoints = 5;

  for (const entry of ACTION_MAP) {
    if (entry.keys.some(k => words.some(w => w.includes(k)))) {
      actionKey = entry.action;
      actionPriority = entry.priority;
      actionPoints = entry.points;
      break;
    }
  }

  let domainName = 'Application';
  let label = 'Feature';
  let epicName = 'General';

  for (const entry of DOMAIN_MAP) {
    if (entry.keys.some(k => lower.includes(k))) {
      domainName = entry.domain;
      label = entry.label;
      epicName = entry.epic;
      break;
    }
  }

  return { actionKey, actionPriority, actionPoints, domainName, label, epicName };
}

function buildDescription(title, ctx) {
  const { actionKey, domainName } = ctx;
  const feature = title.length < 40 ? title : domainName + ' feature';

  const userStory  = (USER_STORY_MAP[actionKey]  || USER_STORY_MAP.build)(feature);
  const acceptance = (ACCEPTANCE_MAP[actionKey]  || ACCEPTANCE_MAP.build).slice(0, 4);
  const techNotes  = (TECH_NOTES_MAP[actionKey]  || TECH_NOTES_MAP.build).slice(0, 3);

  return [
    '**User Story:**',
    userStory,
    '',
    '**Acceptance Criteria:**',
    ...acceptance.map(a => `- [ ] ${a}`),
    '',
    '**Technical Notes:**',
    ...techNotes.map(n => `- ${n}`),
  ].join('\n');
}

exports.suggestTaskDetails = (req, res) => {
  try {
    const { title } = req.body;
    if (!title || !title.trim()) {
      return res.status(400).json({ message: 'Task title is required' });
    }

    const ctx = detectContext(title.trim());
    const description = buildDescription(title.trim(), ctx);

    const result = {
      description,
      priority:    ctx.actionPriority,
      storyPoints: ctx.actionPoints,
      label:       ctx.epicName,
    };

    console.log(`[AI Suggest] ✅ Local: "${title}" → ${result.priority}, ${result.storyPoints}pts, ${result.label}`);
    return res.status(200).json(result);

  } catch (error) {
    console.error('[AI Suggest] Error:', error.message);
    return res.status(500).json({ message: 'AI suggestion failed. Please try again.' });
  }
};
