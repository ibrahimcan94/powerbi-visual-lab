# Architecture

visual.ts owns host lifecycle, formatting service, selection IDs, context menus and React root. KpiCard composes the dashboard and commits renderingFinished in a React effect. destroy unmounts React. Chart events are React-managed, with no global listeners, observers or timers.

src/data/model.ts converts categorical data into nullable typed points. Original indices survive chronological sorting so host selection IDs continue to match categories. Nulls are retained to break paths. Non-finite/non-number measures become null. Headline values are independent role values, never trend aggregates; the model author must remove axis context in DAX. Variance divides by absolute comparison and treats zero comparison as undefined percentage.

src/components uses React for SVG and D3 for memoized geometry. Unique gradient IDs prevent collisions. Date axes use elapsed time; non-date categories preserve host order. Scales include comparison values and negative/constant domains. SVG hit targets support keyboard and context menus. LESS supplies responsive flex layout, tokens and reduced motion.

settings.ts uses SDK formatting model utilities; capabilities.json declares each formatting descriptor. Legacy descriptors and GUID stay stable. tsconfig files entry remains src/visual.ts. strict is enabled; skipLibCheck excludes upstream API declarations with implicit-any/index-signature incompatibilities, not application code.

No external network calls, telemetry or privileges. Dependencies remain unchanged. CLI 7.2.1 targets API 5.11.1; CLI version and API version are distinct. Tests transpile pure modules using the already-installed TypeScript compiler and execute assertions without introducing a test framework.
