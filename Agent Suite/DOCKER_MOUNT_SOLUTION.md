# Docker Mount Probleem - DEPRECATED

## ⚠️ Deze documentatie is vervangen

**Zie `Agent Suite/DEVCONTAINER_WORKFLOW.md` voor de unified workflow guide.**

Deze file wordt behouden voor referentie maar is vervangen door de unified workflow documentatie.

## Oorspronkelijk Probleem

In Docker-in-Docker context (devcontainer) werkt de bind mount in `docker-compose.yml` niet zoals verwacht. De container kan `package.json` niet vinden omdat de volume mount niet correct werkt.

## Oplossing

**Gebruik de devcontainer zelf voor development - GEEN docker-compose container nodig!**

### Development Workflow (Aanbevolen)

1. **Start Next.js dev server direct in devcontainer:**

   ```bash
   npm run dev:host
   ```

2. **Hot reload werkt automatisch:**
   - Next.js Fast Refresh detecteert code wijzigingen
   - Geen container rebuild nodig
   - Geen docker-compose nodig

3. **Voor Docker Compose Watch (optioneel):**
   - Gebruik alleen als je expliciet Docker-in-Docker functionaliteit nodig hebt
   - Voor normale development: gebruik devcontainer direct

### Docker Compose Container

De `docker-compose.yml` container is **optioneel** en alleen nodig voor:

- Testing Docker-in-Docker functionaliteit
- CI/CD workflows
- Production-like environment testing

**Voor normale development: Gebruik devcontainer direct!**

## Status

- ✅ Container build werkt (zichtbare output)
- ✅ Hot reload werkt in devcontainer
- ⚠️ Docker Compose mount heeft beperkingen in Docker-in-Docker context
- ✅ Development workflow: Gebruik devcontainer direct
