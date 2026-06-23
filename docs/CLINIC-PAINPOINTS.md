# Mohs Surgery Clinic — Operational Pain Points & Solution Brief

> Research brief for Dr. T.J. Giuffrida's practice (Coral Gables, FL).
> Focused on small single-surgeon or 1–3 provider Mohs / skin-cancer surgery offices.
> Compiled June 2026. Sources cited inline.

---

## 1. Inventory Pain Points

**1.1 No visibility into real-time stock across the day**
A busy Mohs day can run 4–8 cases. Staff pull supplies per case without a central count, so the 4th case may discover the suture drawer is empty only when the surgeon needs to close. Dermatology inventory software vendors (FlexScanMD, Pipeline Medical) explicitly list "360-degree real-time stock count" as the #1 gap they solve — meaning practices don't have it.
_Source: flexscanmd.com/specialties/dermatology_

**1.2 Expiry waste on short-shelf-life consumables**
Lidocaine with epinephrine (standard Mohs anesthetic: 1% lido + 1:100,000 epi), formalin/fixative, and Vicryl/chromic gut sutures all carry 12–24 month shelf lives and must be discarded if unused before expiry. Small practices ordering in bulk to hit vendor minimums routinely over-purchase. No FEFO (First Expiry First Out) logic is applied — items at the back of the drawer expire first.
_Source: pmc.ncbi.nlm.nih.gov/articles/PMC8178571 (Mohs supply list); flexscanmd.com (expiration monitoring gap)_

**1.3 Liquid nitrogen supply is binary — either full or crisis**
Cryotherapy LN2 dewars are used between Mohs cases and for general derm. Delivery is vendor-scheduled (Air Liquide, Praxair), not demand-driven. Practices typically don't know the tank level until a tech checks it manually. One tissue bank testified: "If we run out of liquid nitrogen, that's 20–25 years of work down the drain." For a derm office, running dry mid-clinic means canceling cryotherapy patients with no warning.
_Source: nitrexgas.com; cryoniq.com/cryo-chamber-guide_

**1.4 Multi-vendor fragmentation with no unified reorder view**
A typical Mohs office buys sutures from Henry Schein (Ethicon/3M brands), cryotherapy supplies from a gas vendor, injectables and anesthetics from a pharmaceutical distributor, and PPE from a fourth supplier. Each vendor has a separate portal, minimum order, and delivery window. Staff spend time logging into 3–4 portals to reorder, with no consolidated shopping list.
_Source: henryschein.com/dermatology; pipelinemedical.com/dermatology-supplies_

**1.5 Supply ordering disconnected from the surgery schedule**
Mohs case volume drives supply consumption directly — a day with 6 cases needs ~6 anesthesia draws, 6 specimen containers, 6 closure trays. But ordering is done weekly by a medical assistant based on a visual shelf check, not based on the upcoming schedule. A case-heavy week after a vacation or holiday can deplete stock before the next order arrives.
_Source: edvak.com/blogs/dermatology-practice-management (scheduling complexity); supply chain analysis_

**1.6 Supply chain disruption risk for surgical consumables**
ECRI data shows supply disruptions delayed surgeries for 74% of surgical facilities surveyed in 2024–2025. Small practices have no backup vendor relationships pre-negotiated and no alert when a primary SKU goes on backorder.
_Source: supplychaindive.com/news/supply-disruptions-delaying-surgeries-ecri_

**1.7 Rising supply costs with no per-case cost capture**
MGMA 2025 data shows medical practice operating costs still rising, with supply costs up year-over-year. Small Mohs practices have no mechanism to know what each case actually cost in consumables — making it impossible to identify waste, negotiate vendor pricing with data, or flag unusually expensive cases.
_Source: mgma.com/mgma-stat/medical-practice-operating-costs-2025_

---

## 2. Prior Authorization Pain Points

**2.1 Mohs is specifically targeted for prior auth by commercial payers**
Most commercial insurers and Medicare Advantage plans require prior authorization for Mohs micrographic surgery (CPT 17311/17312). United Healthcare's Medicare Advantage Mohs policy requires pre-authorization, and Anthem/BCBS varies by state and plan. The AAD fought and won removal of adjacent tissue transfer auth requirements from UHC only in 2023 — after years of lobbying. Prior auth for the repair portion is still active at many payers.
_Source: uhcprovider.com/Mohs-policy; aad.org/member/publications/impact/2022-issue-4/uhc-changes-mohs-prior-authorization-policies_

**2.2 Massive time sink: ~13 staff hours per physician per week**
AMA 2025 survey: physicians complete an average of 39 prior auth requests per physician per week, and practices spend ~13 hours per physician per week completing them. For a 1–2 provider Mohs office, this is a significant share of a full-time employee's capacity spent on phone calls and fax queues rather than clinical work.
_Source: ama-assn.org/practice-management/prior-authorization (2025 survey); fixpriorauth.org_

**2.3 Dermatology offices spend $40,000/year in extra staff for auth alone**
Per AAD data, dermatology practices spend an average of $40,000 on additional staff solely to manage prior authorizations, consuming ~3.5 hours daily per office. 6 in 10 dermatologists say it significantly impacts patient care.
_Source: aadmeetingnews.org/2025-aad/article/burdened-by-prior-authorizations; medibillmd.com_

**2.4 No central tracker — pending auths fall through the cracks**
Most small practices manage pending authorizations via sticky notes, a spreadsheet, or a notes field in the EHR. There is no system that ties a scheduled Mohs case to its authorization status and alerts staff when an auth is still pending 48 hours before the surgery date. Cases proceed without auth and get denied post-service.
_Source: acuityhealthsolutions.com (workflow gaps); annexmed.com (payer policy tracking)_

**2.5 Payer-specific rules are opaque and change constantly**
Insurance companies regularly update their policies for dermatological treatments without reliable notification to practices. For Mohs: some payers require a biopsy pathology report before authorizing; others require a specific diagnosis code pattern; others require the referring dermatologist (not the Mohs surgeon) to submit. These rules are not documented in a single place and require staff to call each payer.
_Source: annexmed.com; infectiousdiseaseadvisor.com/overcoming-challenges-prior-auth_

**2.6 75% of denial letters do not identify the decision-maker**
Analysis of 100 consecutive dermatology prior auth denial letters found that ~75% did not include any real information about who made the denial decision, and 41% gave no covered alternative. This makes appeals nearly impossible to target effectively and extends delays by weeks.
_Source: medibillmd.com (citing AAD research on denial letter transparency)_

**2.7 "Fail-first" step therapy policies delay Mohs-eligible cases**
Commercial payers often require proof that a patient tried standard excision before approving Mohs, even when clinical criteria clearly favor Mohs (e.g., morpheaform BCC near the eye). This requires documentation of a treatment history that may not exist in the Mohs surgeon's own chart — demanding coordination with the referring physician.
_Source: medibillmd.com; annexmed.com_

**2.8 Denial-to-appeal cycle delays revenue and patient care**
One 350-visit dermatology practice received 47 denials totaling $89,000 over 6 months from a single CPT bundling error (billing 11603 alongside 17311). Without a systematic auth-and-billing check linked to the procedure, these errors compound. Appeals take 30–90 days and require clinical staff time for peer-to-peer calls.
_Source: dermatologybilling365.com/mohs-surgery-billing-coding-guide_

---

## 3. The Multi-Layer Solution — How One System Links Both Domains

The core insight: **Mohs surgery schedule is the single source of truth for both supply needs AND insurance authorization needs.** Every scheduled case has a patient, a payer, a procedure, and an anatomy site — that's enough information to trigger parallel workflows in both domains automatically.

### Integration Layer 1 — Schedule → Supply Forecast
**Pain points killed: 1.1, 1.5, 1.7**

When a Mohs case is booked (or a biopsy result comes back positive, triggering a Mohs referral), the system looks up the procedure type and anatomy site and generates a **per-case supply manifest**: expected anesthesia volume (mL of lido/epi), number of specimen containers, suture types for the expected defect size, dressing materials, and pathology cassettes. Rolling these manifests across the next 14 days produces a **dynamic demand forecast**. The shopping list is generated automatically against current inventory levels, not based on a shelf-check. This eliminates surprise stockouts mid-surgery day and over-purchasing that leads to expiry waste.

### Integration Layer 2 — Schedule → Prior Auth Trigger
**Pain points killed: 2.1, 2.4, 2.5**

The moment a Mohs case is scheduled, the system queries the patient's insurance (via eligibility API or payer rules lookup) and determines: (a) does this payer/plan require prior auth for 17311 at this anatomy site? (b) what documentation is required? (c) what is the typical turnaround time for this payer? It then creates an auth task with a deadline tied to the surgery date, assigns it to a staff member, and escalates automatically if not resolved 5 business days before the case. Auth status is visible on the same schedule view the physician sees — no more sticky notes.

### Integration Layer 3 — Auth Approval → Confirmed Supply Release
**Pain points killed: 2.4, 1.5**

Only when prior auth is confirmed does the system "commit" the supply manifest for that case — reserving those units from available inventory and placing a vendor order if stock falls below a reorder threshold. This prevents the perverse scenario of fully stocking for a case that then gets canceled because auth was denied — wasting opened sterile supplies and complicating restocking.

### Integration Layer 4 — Vendor Ordering + Payer Playbooks, Unified
**Pain points killed: 1.4, 2.5, 2.7**

A single dashboard replaces 4 vendor portals: the system holds vendor catalogs (Henry Schein, Medline, gas supplier), maps each supply item to a vendor SKU, and submits purchase orders electronically when the reorder threshold is crossed. Simultaneously, a **payer playbook library** stores the specific prior auth submission rules per payer/plan — documentation required, submission portal URL, typical turnaround, known denial triggers — so staff follow a checklist rather than calling payer lines to ask how to submit.

---

## 4. Overdeliver Ideas — High-Impact Features That Would Make Dr. Giuffrida Say "Wow"

**4.1 FEFO Expiry-Aware Purchasing**
Every supply item carries its lot number and expiration date at receiving (scan barcode). When generating the supply manifest for an upcoming case, the system flags items expiring within 30 days and prioritizes them for consumption first. Reorder quantities account for expected consumption rate so that orders arrive with enough lead time to be used before the previous lot expires — eliminating formalin and lidocaine waste.

**4.2 Payer-Specific Prior Auth Playbooks with Success Rate Tracking**
Store submission rules per payer (UHC Medicare Advantage vs. Aetna Commercial vs. BCBS FL) in a structured playbook. Track approval rate, denial reason, and appeal outcome per payer over time. Over 6 months, the system surfaces: "Aetna denies 22% of 17311 requests when submitted without the referring dermatologist's biopsy report — add it to the checklist." This institutional knowledge is currently in a single staff member's head and walks out the door when they leave.

**4.3 Per-Case Cost Capture and Margin Visibility**
After each Mohs case closes, the system records actual supplies consumed (vs. manifest), procedure codes billed, and expected reimbursement. The physician can see: Case #14 today cost $87 in supplies, billed $1,240 for 17311 + 17312 + 13151, expected net $920 after contractual adjustment. Over time this surfaces which case types have the best margins and which supply items are being over-pulled per case.

**4.4 Lead-Time-Aware Reorder Alerts with Backup Vendor Routing**
Each supply item stores its vendor lead time (Henry Schein: 1–2 business days; gas vendor: 3-day schedule). When the system detects that stock will hit zero before the next delivery can arrive, it alerts immediately — not when stock hits zero. If a primary SKU shows as backordered in the vendor's catalog (via API polling or manual flag), it automatically surfaces the backup SKU from the alternate vendor, pre-populated in the order.

**4.5 LN2 Tank Level Monitoring Integration**
Pair with a low-cost IoT weight sensor on the liquid nitrogen dewar. The system tracks dewar weight in real time and projects days remaining at current consumption rate. When projected empty date falls within 4 days, it automatically emails the gas vendor and flags the clinic manager. Eliminates the "we just ran out mid-clinic" crisis entirely.

**4.6 Recall and Lot-Level Alert System**
FDA Class II and III device/drug recalls are published via MedWatch RSS. The system matches incoming recall alerts against the practice's current inventory lot numbers. If a recalled lot of Ethicon Vicryl sutures is in the drawer, staff get an alert that morning — not three weeks later when a rep mentions it. This is a meaningful patient safety feature that currently no small practice has.

**4.7 Authorization Expiry Watcher**
Prior authorizations have validity windows (typically 90–180 days). If a Mohs case gets postponed past the auth expiration date, the system flags it and initiates a re-auth request — preventing the scenario where a rescheduled case is performed on an expired auth and denied on billing.

**4.8 Biopsy-to-Auth Pipeline (Upstream Trigger)**
When a biopsy pathology result comes back positive for BCC/SCC and the physician marks it as "Mohs indicated" in the EHR, the system immediately creates: (1) a Mohs scheduling placeholder, (2) a prior auth initiation task for the patient's payer, and (3) a supply forecast stub. This compresses the time between "cancer confirmed" and "surgery authorized and scheduled" from weeks (current state) to days.

---

_Sources consulted: AMA 2025 Prior Authorization Physician Survey; AAD 2025 Annual Meeting prior auth burden data; ECRI supply disruption survey 2024; MGMA 2025 practice operating cost data; flexscanmd.com dermatology inventory management; dermatologybilling365.com Mohs coding guide; medibillmd.com prior auth challenges; annexmed.com dermatology billing; UHC Mohs Micrographic Surgery Policy (uhcprovider.com); acuityhealthsolutions.com billing challenges; bonfirerevenue.com Mohs billing; pmc.ncbi.nlm.nih.gov Mohs surgery review; pipelinemedical.com; henryschein.com/dermatology._
