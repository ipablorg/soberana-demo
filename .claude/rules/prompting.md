# Claude Code — Prompting Best Practices

> Diseñar prompts: invocar skill `/prompt-designer`

## Regla #1 — Verificación

Siempre incluir cómo verificar el trabajo. En este repo:

```bash
npm run type-check && npm run lint
npx vitest run path/to/file.test.ts   # tests específicos
npm run i18n:verify                   # si hay strings nuevas
```

## Flujo: Explorar → Planificar → Implementar

1. **Explore** (Plan Mode): entender codebase sin editar
2. **Plan**: plan detallado para tareas complejas o riesgosas
3. **Implement**: cambios con scope mínimo
4. **Verify**: type-check, lint, tests
5. **Commit/PR**: solo si el usuario lo pide

## Prompts efectivos

- **Scope específico**: archivo, comportamiento esperado, restricciones
- **Patrones existentes**: "sigue el patrón de X en Y.tsx"
- **Referencias**: `@docs/GRAPHQL_INTEGRATION.md`, `@CLAUDE.md`, archivos concretos
- **Una tarea por prompt** — dividir tareas no relacionadas

## Features según necesidad

| Necesidad | Feature |
|-----------|---------|
| Explorar sin cambiar | `--permission-mode plan` |
| Contexto aislado | subagent o `--worktree` |
| Tarea repetible | `.claude/skills/<name>/SKILL.md` |
| Acción determinística | hooks en `.claude/settings.json` |
| Automatización CI | `claude -p "..." --output-format json` |

## Skills del proyecto

`/prompt-designer` `/component` `/feature` `/graphql` `/i18n` `/qa` `/audit` `/ship` `/refactor` `/soberana-ux` `/loopay-marcom`

## Antipatrones

- Sesión con múltiples tareas no relacionadas → `/clear`
- Prompt vago sin verificación → añadir criterios concretos
- Exploración infinita → scope estrecho o subagent
- Commits/push sin petición explícita del usuario
