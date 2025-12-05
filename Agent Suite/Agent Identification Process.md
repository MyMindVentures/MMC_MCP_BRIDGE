# 🔍 Agent Identification Process

## Purpose

Dit proces beschrijft hoe je proactief nieuwe AI agents identificeert die nodig zijn voor specifieke categorieën door codebase analyse, en hoe je deze agents aanmaakt volgens de Role Description Template.

---

## 🎯 Process Overview

```
Codebase Analysis → Categorization → Gap Identification → Agent Creation → Validation → Integration
```

---

## 📋 Step-by-Step Process

### Step 1: Codebase Analysis

**Doel:** Begrijp de codebase volledig met Code as Context en Graph toepassing.

**Acties:**

1. **Code as Context Analysis**

   - Analyseer alle belangrijke directories en files
   - Identificeer patterns, architecture, en dependencies
   - Begrijp hoe verschillende componenten samenwerken
   - Detecteer complexe gebieden die gespecialiseerde agents nodig hebben

2. **Graph Application**

   - Visualiseer dependencies tussen modules
   - Identificeer clusters van gerelateerde functionaliteit
   - Detecteer isolatie opportunities (waar een agent kan helpen)
   - Begrijp data flow en communication patterns

3. **MCP Server Analysis**

   - Review `app/api/mcp-config.ts` voor alle MCP servers
   - Identificeer categorieën: Databases, AI, Dev Tools, Productivity, Integration
   - Detecteer welke MCP servers nog geen gespecialiseerde agent hebben
   - Begrijp hoe MCP servers gebruikt worden in workflows

4. **n8n Integration Analysis**
   - Review n8n integration patterns in codebase
   - Identificeer workflow requirements
   - Detecteer waar agents kunnen helpen met n8n workflows
   - Begrijp bidirectional sync requirements

**Output:** Lijst van categorieën en functionaliteit die gespecialiseerde agents nodig hebben.

---

### Step 2: Categorization

**Doel:** Categoriseer geïdentificeerde agents in logische groepen.

**Categorieën:**

#### Infrastructure

- Docker, Railway, Dagger, Doppler
- Container management, deployment, secrets management

#### Databases

- Postgres, MongoDB, SQLite
- Schema management, queries, migrations, data operations

#### AI/ML

- OpenAI, Anthropic, Ollama
- Model selection, prompt engineering, embeddings, vision

#### Dev Tools

- Git, GitHub, Playwright, Puppeteer
- Version control, browser automation, testing

#### Productivity

- Notion, Slack, Linear, n8n
- Documentation, communication, project management, workflows

#### Integration

- Stripe, Airtable, Google Drive, Raindrop, Postman
- Payment processing, data management, API testing

#### Testing

- E2E, Playwright, Dagger
- Test automation, validation, CI/CD testing

#### CI/CD

- GitHub Actions, Railway, Dagger
- Pipeline management, deployment automation

**Acties:**

1. **Categorize Identified Needs**

   - Groepeer gerelateerde functionaliteit
   - Identificeer welke categorieën nog geen agent hebben
   - Prioriteer categorieën op basis van project behoefte

2. **Check Existing Agents**

   - Review `Agent Suite/` directory voor bestaande agents
   - Identificeer gaps in coverage
   - Detecteer overlap (te vermijden)

3. **Prioritize**
   - Focus op categorieën met meeste impact
   - Prioriteer categorieën die kritiek zijn voor project
   - Overweeg dependencies (sommige agents hebben andere agents nodig)

**Output:** Gecategoriseerde lijst van agents die nodig zijn, met prioriteiten.

---

### Step 3: Gap Identification

**Doel:** Identificeer specifieke gaps waar nieuwe agents nodig zijn.

**Acties:**

1. **Compare with Existing**

   - Check welke categorieën al agents hebben
   - Identificeer welke categorieën nog geen agent hebben
   - Detecteer sub-categorieën die gespecialiseerde agents nodig hebben

2. **Complexity Analysis**

   - Identificeer complexe gebieden die gespecialiseerde knowledge nodig hebben
   - Detecteer gebieden waar fouten vaak voorkomen
   - Begrijp waar automation en specialisatie meeste waarde toevoegen

3. **Integration Points**
   - Identificeer waar agents moeten integreren met MCP servers
   - Detecteer n8n workflow requirements
   - Begrijp bidirectional sync needs

**Output:** Specifieke lijst van agents die moeten worden aangemaakt, met rationale.

---

### Step 4: Agent Creation

**Doel:** Creëer nieuwe agent Role Description volgens template.

**Acties:**

1. **Use Template**

   - Open `Role Description Template.md`
   - Volg template structuur strikt
   - Vul elke sectie in met specifieke informatie

2. **Define Core Responsibility**

   - Eén duidelijke zin die agent's primaire doel beschrijft
   - Specifiek, niet generiek
   - Context waar nodig voor duidelijkheid

3. **Define Key Responsibilities**

   - 3-5 verantwoordelijkheidsgebieden
   - Elke area met specifieke taken
   - Concrete acties, niet vage beschrijvingen

4. **Define Technical Skills**

   - Alleen essentiële skills
   - Specifieke capabilities, niet generieke lijsten
   - Preferred skills alleen waar relevant

5. **Define Project Structure**

   - Alleen relevante directories/files
   - Minimal, niet exhaustive
   - Focus op wat agent nodig heeft

6. **Define Common Tasks**

   - Frequently used commands/tasks
   - Reference scripts, don't duplicate
   - Practical examples

7. **Define Best Practices**

   - Critical practices die errors voorkomen
   - Focus op quality, niet exhaustive lists

8. **Define Important Notes**

   - Alleen kritieke constraints
   - Rules die failures veroorzaken als genegeerd

9. **Define Success Criteria**
   - 3-5 measurable outcomes
   - Specific, not vague

**Output:** Complete Role Description volgens template.

---

### Step 5: Validation

**Doel:** Valideer dat Role Description kwaliteit heeft en geen verwarring veroorzaakt.

**Checklist:**

- [ ] **Length**: Max 250-300 regels (niet overweldigend)
- [ ] **Structure**: Volgt template strikt
- [ ] **Clarity**: Elke sectie is duidelijk en actionable
- [ ] **Specificity**: Concrete acties, geen vage beschrijvingen
- [ ] **Focus**: Alleen essentieel, niet exhaustive
- [ ] **Actionable**: Hoe te doen, niet alleen wat te weten
- [ ] **No Overlap**: Geen overlap met bestaande agents
- [ ] **Enterprise Ready**: MCP/n8n integration waar relevant
- [ ] **Context Window**: Optimaliseert context window gebruik

**Acties:**

1. **Self-Review**

   - Lees Role Description als nieuwe agent
   - Check of alles duidelijk is
   - Identificeer verwarrende secties

2. **Template Compliance**

   - Check dat alle template secties aanwezig zijn
   - Valideer dat structuur correct is
   - Check formatting consistency

3. **Quality Check**
   - Valideer concise, specific, focused, actionable
   - Check dat geen overweldigende beschrijvingen zijn
   - Zorg dat context window optimaal gebruikt wordt

**Output:** Gevalideerde Role Description klaar voor gebruik.

---

### Step 6: Integration

**Doel:** Integreer nieuwe agent in Agent Suite en documenteer.

**Acties:**

1. **Save Role Description**

   - Sla op als: `[Category] Specialist.md`
   - Locatie: `/workspaces/MMC_MCP_BRIDGE/Agent Suite/`
   - Format: Markdown, volgens template

2. **Update Documentation**

   - Update deze process document indien nodig
   - Documenteer rationale voor nieuwe agent
   - Noteer dependencies met andere agents

3. **Test Integration**
   - Test dat agent werkt met MCP servers
   - Valideer n8n integration waar relevant
   - Check dat agent perfect functioneert met n8n MCP Instance

**Output:** Nieuwe agent geïntegreerd in Agent Suite.

---

## 🔄 Continuous Improvement Process

### Regular Reviews

**Frequency:** Maandelijks of wanneer project significant groeit.

**Acties:**

1. **Review All Agents**

   - Check of agents nog up-to-date zijn
   - Identificeer nieuwe requirements
   - Detecteer verbetering opportunities

2. **Update Agents**

   - Voeg nieuwe verantwoordelijkheden toe
   - Update enterprise features (MCP/n8n integration)
   - Verbeter clarity en specificity

3. **Ecosystem Sync**
   - Zorg dat agents werken met n8n MCP Instance
   - Valideer bidirectional sync compatibility
   - Test Workflow Builder integration

---

## 📊 Example: Identifying a New Agent

### Scenario: Project heeft nieuwe MongoDB complex queries nodig

**Step 1: Codebase Analysis**

- Analyseer `app/api/mcp-config.ts` → MongoDB MCP heeft 18+ tools
- Review MongoDB usage patterns → Complex aggregations, indexes, schema management
- Detecteer dat geen gespecialiseerde MongoDB agent bestaat

**Step 2: Categorization**

- Categorie: **Databases**
- Sub-categorie: **MongoDB Specialist**
- Prioriteit: **High** (veel MongoDB operations in project)

**Step 3: Gap Identification**

- Gap: Geen agent voor MongoDB-specifieke operations
- Need: Agent die MongoDB queries, aggregations, indexes, schema management beheert
- Integration: Moet werken met MongoDB MCP server

**Step 4: Agent Creation**

- Genereer `MongoDB Specialist.md` volgens template
- Define core responsibility: MongoDB database management, queries, aggregations
- Define key responsibilities: Query optimization, aggregation pipelines, index management, schema design
- Define technical skills: MongoDB, aggregation pipelines, indexes, performance optimization
- Define common tasks: MongoDB MCP tool usage, query building, aggregation design
- Define best practices: Index optimization, query performance, schema design
- Define important notes: MongoDB MCP server integration, connection management

**Step 5: Validation**

- Check length: ~200 regels ✅
- Check structure: Volgt template ✅
- Check clarity: Alles duidelijk ✅
- Check specificity: Concrete acties ✅
- Check enterprise: MCP integration ✅

**Step 6: Integration**

- Save als `MongoDB Specialist.md`
- Test met MongoDB MCP server
- Valideer n8n integration

---

## 🎯 Success Criteria

- ✅ **Proactive Identification**: Nieuwe agents geïdentificeerd voordat ze kritiek worden
- ✅ **Quality**: Alle agents volgen template en zijn concise, specific, focused, actionable
- ✅ **Coverage**: Alle belangrijke categorieën hebben gespecialiseerde agents
- ✅ **Enterprise Ready**: Alle agents hebben MCP/n8n integration
- ✅ **Ecosystem Integration**: Agents werken perfect met n8n MCP Instance
- ✅ **Continuous Improvement**: Agents worden regelmatig geüpdatet

---

**Last Updated**: December 2024  
**Maintained By**: AI Role Instructions Specialist
