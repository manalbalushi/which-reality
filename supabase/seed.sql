-- ============================================================================
-- OT Risk Management — Sample Data (section 41)
-- Run AFTER migrations AND after the demo users exist in auth.users/profiles
-- (production: scripts/seed-auth-users.mjs; local dev: local_dev_seed_users.sql)
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Reference / configuration data
-- ----------------------------------------------------------------------------
insert into departments (name) values
  ('Operations'), ('OT Engineering'), ('OT Cybersecurity'), ('IT'),
  ('Process Safety'), ('Maintenance'), ('Third Party Management'), ('Executive Management')
on conflict do nothing;

insert into business_units (name) values
  ('Refining'), ('Petrochemicals'), ('Power Generation'), ('Water Treatment'), ('Pipeline Operations')
on conflict do nothing;

insert into assessment_types_config (code, label, description) values
  ('light', 'Light Risk Assessment', 'Streamlined single-session assessment for lower-complexity scope.'),
  ('full', 'Full Risk Assessment', '15-step comprehensive wizard with scope, participants, controls and formal approval.')
on conflict do nothing;

insert into risk_categories (name, sort_order) values
  ('Cybersecurity', 1), ('Access Management', 2), ('Network Security', 3), ('Remote Access', 4),
  ('Vulnerability Management', 5), ('Patch Management', 6), ('Malware', 7), ('Configuration', 8),
  ('Backup', 9), ('Monitoring', 10), ('Third Party', 11), ('Physical Security', 12),
  ('People', 13), ('Process', 14), ('Technology', 15), ('Other', 16)
on conflict do nothing;

insert into control_categories (name, sort_order) values
  ('Access Control', 1), ('Network Security', 2), ('Endpoint Security', 3),
  ('Monitoring & Logging', 4), ('Backup & Recovery', 5), ('Patch & Vulnerability Management', 6),
  ('Physical Security', 7), ('Third Party Management', 8), ('Governance', 9)
on conflict do nothing;

insert into action_priorities_config (code, label, sort_order, sla_days) values
  ('critical', 'Critical', 1, 7), ('high', 'High', 2, 14),
  ('medium', 'Medium', 3, 30), ('low', 'Low', 4, 60)
on conflict do nothing;

insert into ot_levels (code, name, description, sort_order) values
  ('L4', 'Level 4 — Enterprise / Business', 'Corporate IT, ERP, business systems', 1),
  ('L3_5', 'Level 3.5 — DMZ', 'Industrial DMZ between IT and OT', 2),
  ('L3', 'Level 3 — Site Operations', 'Site manufacturing operations & control', 3),
  ('L2', 'Level 2 — Supervisory', 'SCADA / HMI supervisory control', 4),
  ('L1', 'Level 1 — Basic Control', 'PLC / DCS / SIS controllers', 5),
  ('L0', 'Level 0 — Process', 'Field instruments, sensors, actuators', 6)
on conflict do nothing;

insert into risk_likelihood_levels (value, label, description) values
  (1, 'Rare', 'May occur only in exceptional circumstances'),
  (2, 'Unlikely', 'Could occur at some time'),
  (3, 'Possible', 'Might occur at some time'),
  (4, 'Likely', 'Will probably occur in most circumstances'),
  (5, 'Almost Certain', 'Expected to occur in most circumstances')
on conflict do nothing;

insert into risk_impact_levels (value, label, description) values
  (1, 'Insignificant', 'No disruption to OT operations or safety'),
  (2, 'Minor', 'Minor disruption, no safety impact'),
  (3, 'Moderate', 'Localized process disruption'),
  (4, 'Major', 'Significant process/safety impact'),
  (5, 'Severe', 'Major safety, environmental or production impact')
on conflict do nothing;

insert into risk_rating_thresholds (rating, min_score, max_score, color, sort_order) values
  ('Low', 1, 4, '#2E7D32', 1),
  ('Medium', 5, 9, '#F9A825', 2),
  ('High', 10, 16, '#EF6C00', 3),
  ('Critical', 17, 25, '#C62828', 4)
on conflict do nothing;

insert into controls (control_code, name, description, category_id) values
  ('CTRL-001', 'Multi-Factor Authentication', 'MFA enforced for all remote and privileged access', (select id from control_categories where name = 'Access Control')),
  ('CTRL-002', 'VPN Remote Access Gateway', 'Dedicated, monitored VPN concentrator for OT remote access', (select id from control_categories where name = 'Network Security')),
  ('CTRL-003', 'Session Recording & Logging', 'All remote sessions recorded and retained for review', (select id from control_categories where name = 'Monitoring & Logging')),
  ('CTRL-004', 'Network Segmentation (Purdue Model)', 'Zone/conduit segmentation between IT, DMZ and OT levels', (select id from control_categories where name = 'Network Security')),
  ('CTRL-005', 'OT Firewall Rule Review', 'Periodic review of firewall rule bases at OT boundaries', (select id from control_categories where name = 'Network Security')),
  ('CTRL-006', 'Privileged Access Management', 'Vaulted, time-boxed privileged credentials', (select id from control_categories where name = 'Access Control')),
  ('CTRL-007', 'Endpoint Application Whitelisting', 'Whitelisting on engineering workstations and servers', (select id from control_categories where name = 'Endpoint Security')),
  ('CTRL-008', 'Patch Management Program', 'Formal OT patch evaluation and deployment process', (select id from control_categories where name = 'Patch & Vulnerability Management')),
  ('CTRL-009', 'Backup & Recovery Procedure', 'Regular backups with tested restoration procedure', (select id from control_categories where name = 'Backup & Recovery')),
  ('CTRL-010', 'Security Monitoring / SIEM', 'Centralized log collection and alerting for OT assets', (select id from control_categories where name = 'Monitoring & Logging')),
  ('CTRL-011', 'Vendor Remote Access Policy', 'Formal policy governing third-party remote access', (select id from control_categories where name = 'Third Party Management')),
  ('CTRL-012', 'Asset Inventory Management', 'Maintained inventory of OT assets and firmware versions', (select id from control_categories where name = 'Governance')),
  ('CTRL-013', 'Physical Access Control', 'Badge/biometric access control to control rooms and racks', (select id from control_categories where name = 'Physical Security')),
  ('CTRL-014', 'Security Awareness Training', 'Annual OT cybersecurity awareness training', (select id from control_categories where name = 'Governance')),
  ('CTRL-015', 'Vulnerability Assessment Program', 'Periodic vulnerability scanning of OT network segments', (select id from control_categories where name = 'Patch & Vulnerability Management')),
  ('CTRL-016', 'Change Management Process', 'Formal change control for OT configuration changes', (select id from control_categories where name = 'Governance')),
  ('CTRL-017', 'Incident Response Plan', 'OT-specific cyber incident response and escalation plan', (select id from control_categories where name = 'Governance')),
  ('CTRL-018', 'Configuration Baseline Management', 'Golden-image configuration baselines with drift detection', (select id from control_categories where name = 'Endpoint Security'))
on conflict do nothing;

-- Assign demo users to departments
update profiles set department_id = (select id from departments where name = 'OT Cybersecurity') where email in ('admin@otrisk.local','risk.manager@otrisk.local','cyber.engineer@otrisk.local','auditor@otrisk.local');
update profiles set department_id = (select id from departments where name = 'OT Engineering') where email in ('assessor@otrisk.local','ot.engineer@otrisk.local');
update profiles set department_id = (select id from departments where name = 'Operations') where email = 'process.owner@otrisk.local';
update profiles set department_id = (select id from departments where name = 'Executive Management') where email = 'approver@otrisk.local';

-- ----------------------------------------------------------------------------
-- 2. Asset Register (20 assets, section 13/41)
-- ----------------------------------------------------------------------------
insert into assets (asset_code, name, asset_type, system_name, location, business_process, criticality, owner_id, environment, network_zone, department_id) values
  ('DCS-001', 'Refinery Unit 1 Distributed Control System', 'DCS', 'Honeywell Experion PKS', 'Refinery Site A', 'Crude Distillation', 'Critical', (select id from profiles where email='ot.engineer@otrisk.local'), 'Production', 'Level 1', (select id from departments where name='OT Engineering')),
  ('DCS-002', 'Refinery Unit 2 Distributed Control System', 'DCS', 'Honeywell Experion PKS', 'Refinery Site A', 'Catalytic Reforming', 'Critical', (select id from profiles where email='ot.engineer@otrisk.local'), 'Production', 'Level 1', (select id from departments where name='OT Engineering')),
  ('PLC-101', 'Utilities Skid PLC', 'PLC', 'Allen-Bradley ControlLogix', 'Refinery Site A', 'Utilities / Steam', 'High', (select id from profiles where email='ot.engineer@otrisk.local'), 'Production', 'Level 1', (select id from departments where name='OT Engineering')),
  ('PLC-102', 'Cooling Water PLC', 'PLC', 'Siemens S7-1500', 'Refinery Site A', 'Cooling Water', 'High', (select id from profiles where email='ot.engineer@otrisk.local'), 'Production', 'Level 1', (select id from departments where name='OT Engineering')),
  ('PLC-103', 'Tank Farm PLC', 'PLC', 'Allen-Bradley ControlLogix', 'Tank Farm B', 'Storage & Loading', 'High', (select id from profiles where email='ot.engineer@otrisk.local'), 'Production', 'Level 1', (select id from departments where name='OT Engineering')),
  ('PLC-104', 'Wastewater Treatment PLC', 'PLC', 'Siemens S7-1500', 'Water Treatment Plant', 'Effluent Treatment', 'Medium', (select id from profiles where email='ot.engineer@otrisk.local'), 'Production', 'Level 1', (select id from departments where name='OT Engineering')),
  ('SCADA-001', 'Pipeline SCADA System', 'SCADA', 'OSIsoft PI / Ignition', 'Pipeline Control Center', 'Pipeline Operations', 'Critical', (select id from profiles where email='cyber.engineer@otrisk.local'), 'Production', 'Level 2', (select id from departments where name='OT Cybersecurity')),
  ('SCADA-002', 'Water Distribution SCADA', 'SCADA', 'Wonderware System Platform', 'Water Treatment Plant', 'Water Distribution', 'High', (select id from profiles where email='cyber.engineer@otrisk.local'), 'Production', 'Level 2', (select id from departments where name='OT Cybersecurity')),
  ('SIS-001', 'Unit 1 Safety Instrumented System', 'SIS', 'Triconex Tricon', 'Refinery Site A', 'Emergency Shutdown', 'Critical', (select id from profiles where email='ot.engineer@otrisk.local'), 'Production', 'Level 1', (select id from departments where name='Process Safety')),
  ('SIS-002', 'Unit 2 Safety Instrumented System', 'SIS', 'Triconex Tricon', 'Refinery Site A', 'Emergency Shutdown', 'Critical', (select id from profiles where email='ot.engineer@otrisk.local'), 'Production', 'Level 1', (select id from departments where name='Process Safety')),
  ('HIST-001', 'Plant Historian', 'Historian', 'OSIsoft PI Server', 'Refinery Site A', 'Process Data Archival', 'High', (select id from profiles where email='cyber.engineer@otrisk.local'), 'Production', 'Level 3', (select id from departments where name='OT Engineering')),
  ('EWS-001', 'DCS Engineering Workstation', 'Engineering_Workstation', 'Windows 10 / Experion Engineering Tools', 'Refinery Site A', 'Control System Engineering', 'High', (select id from profiles where email='ot.engineer@otrisk.local'), 'Production', 'Level 2', (select id from departments where name='OT Engineering')),
  ('EWS-002', 'PLC Programming Workstation', 'Engineering_Workstation', 'Windows 10 / RSLogix / TIA Portal', 'Refinery Site A', 'Control System Engineering', 'Medium', (select id from profiles where email='ot.engineer@otrisk.local'), 'Production', 'Level 2', (select id from departments where name='OT Engineering')),
  ('HMI-001', 'Control Room HMI Cluster', 'HMI', 'Experion Station', 'Refinery Site A', 'Operator Console', 'Critical', (select id from profiles where email='ot.engineer@otrisk.local'), 'Production', 'Level 2', (select id from departments where name='OT Engineering')),
  ('HMI-002', 'Pipeline Control HMI', 'HMI', 'Ignition Perspective', 'Pipeline Control Center', 'Operator Console', 'High', (select id from profiles where email='cyber.engineer@otrisk.local'), 'Production', 'Level 2', (select id from departments where name='OT Cybersecurity')),
  ('SRV-001', 'OT Domain Controller', 'Server', 'Windows Server 2019', 'Refinery Site A', 'Identity & Access', 'Critical', (select id from profiles where email='cyber.engineer@otrisk.local'), 'Production', 'Level 3', (select id from departments where name='OT Cybersecurity')),
  ('NET-001', 'OT Core Switch Stack', 'Network_Device', 'Cisco Catalyst 9300', 'Refinery Site A', 'Network Backbone', 'Critical', (select id from profiles where email='cyber.engineer@otrisk.local'), 'Production', 'Level 3', (select id from departments where name='OT Cybersecurity')),
  ('FW-001', 'IT/OT Boundary Firewall', 'Firewall', 'Palo Alto PA-5220', 'Refinery Site A', 'Perimeter Security', 'Critical', (select id from profiles where email='cyber.engineer@otrisk.local'), 'Production', 'Level 3.5 DMZ', (select id from departments where name='OT Cybersecurity')),
  ('FW-002', 'Remote Access Firewall', 'Firewall', 'Fortinet FortiGate 200F', 'Refinery Site A', 'Remote Access Perimeter', 'Critical', (select id from profiles where email='cyber.engineer@otrisk.local'), 'Production', 'Level 3.5 DMZ', (select id from departments where name='OT Cybersecurity')),
  ('APP-001', 'Manufacturing Execution System', 'Application', 'AVEVA MES', 'Refinery Site A', 'Production Scheduling', 'High', (select id from profiles where email='cyber.engineer@otrisk.local'), 'Production', 'Level 3', (select id from departments where name='OT Engineering')),
  ('OTH-001', 'Site Wireless Access Points', 'Other', 'Cisco Industrial Wireless', 'Refinery Site A', 'Mobile Field Operations', 'Medium', (select id from profiles where email='cyber.engineer@otrisk.local'), 'Production', 'Level 2', (select id from departments where name='OT Cybersecurity'))
on conflict do nothing;

-- ----------------------------------------------------------------------------
-- 3. Assessments, Risks, Controls, Actions, Evidence, Participants, Approvals
-- Built with a PL/pgSQL block so child rows can reference the IDs generated
-- by the auto-code triggers (assessment_code, risk_code, action_code, ...).
-- ----------------------------------------------------------------------------
do $$
declare
  u_admin uuid := (select id from profiles where email='admin@otrisk.local');
  u_rm uuid := (select id from profiles where email='risk.manager@otrisk.local');
  u_assessor uuid := (select id from profiles where email='assessor@otrisk.local');
  u_po uuid := (select id from profiles where email='process.owner@otrisk.local');
  u_approver uuid := (select id from profiles where email='approver@otrisk.local');
  u_cyber uuid := (select id from profiles where email='cyber.engineer@otrisk.local');
  u_ot uuid := (select id from profiles where email='ot.engineer@otrisk.local');
  u_auditor uuid := (select id from profiles where email='auditor@otrisk.local');

  bu_refining uuid := (select id from business_units where name='Refining');
  bu_pipeline uuid := (select id from business_units where name='Pipeline Operations');
  bu_water uuid := (select id from business_units where name='Water Treatment');

  dep_ot uuid := (select id from departments where name='OT Engineering');
  dep_cyber uuid := (select id from departments where name='OT Cybersecurity');
  dep_ops uuid := (select id from departments where name='Operations');

  cat_remote uuid := (select id from risk_categories where name='Remote Access');
  cat_network uuid := (select id from risk_categories where name='Network Security');
  cat_patch uuid := (select id from risk_categories where name='Patch Management');
  cat_backup uuid := (select id from risk_categories where name='Backup');
  cat_thirdparty uuid := (select id from risk_categories where name='Third Party');
  cat_access uuid := (select id from risk_categories where name='Access Management');
  cat_monitor uuid := (select id from risk_categories where name='Monitoring');
  cat_config uuid := (select id from risk_categories where name='Configuration');
  cat_malware uuid := (select id from risk_categories where name='Malware');
  cat_physical uuid := (select id from risk_categories where name='Physical Security');

  ast_dcs1 uuid := (select id from assets where asset_code='DCS-001');
  ast_dcs2 uuid := (select id from assets where asset_code='DCS-002');
  ast_plc1 uuid := (select id from assets where asset_code='PLC-101');
  ast_plc3 uuid := (select id from assets where asset_code='PLC-103');
  ast_scada1 uuid := (select id from assets where asset_code='SCADA-001');
  ast_hist uuid := (select id from assets where asset_code='HIST-001');
  ast_ews1 uuid := (select id from assets where asset_code='EWS-001');
  ast_fw2 uuid := (select id from assets where asset_code='FW-002');
  ast_srv uuid := (select id from assets where asset_code='SRV-001');
  ast_hmi2 uuid := (select id from assets where asset_code='HMI-002');

  ctrl_mfa uuid := (select id from controls where control_code='CTRL-001');
  ctrl_vpn uuid := (select id from controls where control_code='CTRL-002');
  ctrl_session uuid := (select id from controls where control_code='CTRL-003');
  ctrl_seg uuid := (select id from controls where control_code='CTRL-004');
  ctrl_fw uuid := (select id from controls where control_code='CTRL-005');
  ctrl_pam uuid := (select id from controls where control_code='CTRL-006');
  ctrl_patch uuid := (select id from controls where control_code='CTRL-008');
  ctrl_backup uuid := (select id from controls where control_code='CTRL-009');
  ctrl_siem uuid := (select id from controls where control_code='CTRL-010');
  ctrl_vendor uuid := (select id from controls where control_code='CTRL-011');

  -- working variables
  aid uuid;         -- current assessment id
  acode text;        -- current assessment code
  rid uuid;          -- current risk id
  acid uuid;         -- current assessment_control id
  eid uuid;          -- evidence id
  aid_action uuid;   -- action id
  pid uuid;          -- participant id

  topics text[][] := array[
    array['OT Firewall Rule Review — IT/OT Boundary','light','FW-002'],
    array['Engineering Workstation Hardening Assessment','full','EWS-001'],
    array['Historian Backup & Recovery Resilience Assessment','light','HIST-001'],
    array['Privileged Access Management Assessment — OT Domain','full','SRV-001']
  ];
  t record;
  i int;
  j int;
  risk_titles text[];
  cause_txt text; event_txt text; conseq_txt text;
  inh_l int; inh_i int; res_l int; res_i int;
  treat treatment_option;
  act_target date; act_status action_status;
begin

  ----------------------------------------------------------------------------
  -- FLAGSHIP #1 — the exact section 37 test scenario:
  -- "DCS Remote Access Risk Assessment", Full, completed & approved.
  ----------------------------------------------------------------------------
  insert into assessments (
    title, type, status, asset_id, asset_id_text, business_unit_id, location,
    process_owner_id, assessment_owner_id, assessment_date, due_date, completion_date,
    reason_for_assessment, description, objective, scope_in, scope_out, boundary,
    business_process, ot_environment, network_zone, methodology,
    scope_system, scope_asset, scope_technology, assessment_criteria,
    start_date, end_date, created_by
  ) values (
    'DCS Remote Access Risk Assessment', 'full', 'completed', ast_dcs1, 'DCS-001', bu_refining, 'Refinery Site A',
    u_po, u_assessor, date '2026-08-10', date '2026-09-15', date '2026-09-10',
    'Annual review of third-party vendor remote access into the Unit 1 DCS environment.',
    'Comprehensive risk assessment of remote access pathways used by control-system vendors to support and troubleshoot the Unit 1 DCS.',
    'Identify and treat risks associated with vendor remote access to the DCS so that residual risk is reduced to an acceptable level.',
    'Remote access gateway, VPN, jump host, vendor accounts, DCS engineering network (Level 1-2).',
    'Corporate IT network, business applications, physical security.',
    'Vendor remote access path from Level 3.5 DMZ into Level 1/2 DCS network at Refinery Site A.',
    'Crude Distillation', 'Production', 'Level 1 / Level 2', 'Qualitative 5x5 risk matrix aligned to ISA/IEC 62443 principles.',
    'Honeywell Experion PKS', 'DCS-001', 'VPN concentrator, jump host, MFA platform', 'Likelihood x Impact, thresholds per organizational risk matrix',
    date '2026-08-10', date '2026-09-10', u_assessor
  ) returning id, assessment_code into aid, acode;

  insert into assessment_ot_levels (assessment_id, ot_level_id)
  select aid, id from ot_levels where code in ('L1','L2','L3_5');

  insert into assessment_assets (assessment_id, asset_id) values (aid, ast_dcs1);

  insert into assessment_participants (assessment_id, name, job_title, department, organization, role_in_assessment, email, participation_type, date_participated, comments) values
  (aid, 'Maryam Al-Lawati', 'OT Engineer', 'OT Engineering', 'Refinery Site A', 'Technical SME', 'ot.engineer@otrisk.local', 'workshop', date '2026-08-12', 'Provided DCS network architecture detail.'),
  (aid, 'Yousuf Al-Balushi', 'OT Cybersecurity Engineer', 'OT Cybersecurity', 'Refinery Site A', 'Risk Assessor', 'cyber.engineer@otrisk.local', 'risk_assessment', date '2026-08-12', 'Led risk identification workshop.'),
  (aid, 'Fatma Al-Zadjali', 'Process Owner', 'Operations', 'Refinery Site A', 'Process Owner', 'process.owner@otrisk.local', 'validation', date '2026-08-13', 'Validated operational impact ratings.');

  -- Risk 1: the flagship risk (exact numbers from the scenario)
  insert into risks (
    assessment_id, lineage_key, title, cause, event, consequence_text, category_id, source, threat, vulnerability,
    consequence, affected_asset_id, affected_process, existing_controls_text,
    inherent_likelihood, inherent_impact, residual_likelihood, residual_impact,
    treatment, owner_id, created_by
  ) values (
    aid, 'DCS-001-REMOTE-ACCESS', 'Unauthorized vendor remote access',
    'remote access accounts for control-system vendors are not consistently reviewed or time-boxed',
    'an unauthorized or compromised vendor session gains remote access to the Unit 1 DCS',
    'loss of process control, unplanned shutdown, or unsafe operating conditions',
    cat_remote, 'External vendor connectivity', 'Compromised vendor credentials / insider misuse', 'Standing vendor accounts without periodic access review',
    'Loss of view/control of DCS, potential unsafe process state, production downtime', ast_dcs1, 'Crude Distillation',
    'VPN; MFA; session logging (in place but not consistently enforced for all vendor accounts)',
    4, 5, 2, 4,
    'mitigate', u_ot, u_assessor
  ) returning id into rid;

  -- Controls in place for this risk
  insert into assessment_controls (assessment_id, control_id, applicability, implementation_status, control_owner_id, evidence_available, evidence_reference, effectiveness, comments) values
  (aid, ctrl_vpn, 'applicable', 'implemented', u_cyber, true, 'VPN-CONFIG-2026-08.pdf', 'partially_effective', 'VPN in place; split-tunneling disabled but account review cadence is inconsistent.')
  returning id into acid;
  insert into risk_controls (risk_id, assessment_control_id) values (rid, acid);

  insert into assessment_controls (assessment_id, control_id, applicability, implementation_status, control_owner_id, evidence_available, evidence_reference, effectiveness, comments) values
  (aid, ctrl_mfa, 'applicable', 'implemented', u_cyber, true, 'MFA-ENROLLMENT-2026.xlsx', 'effective', 'MFA enforced at VPN gateway for all vendor accounts.')
  returning id into acid;
  insert into risk_controls (risk_id, assessment_control_id) values (rid, acid);

  insert into assessment_controls (assessment_id, control_id, applicability, implementation_status, control_owner_id, evidence_available, evidence_reference, effectiveness, comments) values
  (aid, ctrl_session, 'applicable', 'partially_implemented', u_cyber, true, 'SESSION-LOG-SAMPLE.pdf', 'partially_effective', 'Session logging enabled; log review not yet formalized.')
  returning id into acid;
  insert into risk_controls (risk_id, assessment_control_id) values (rid, acid);

  insert into assessment_controls (assessment_id, control_id, applicability, na_justification, implementation_status, control_owner_id, effectiveness, comments) values
  (aid, ctrl_pam, 'not_applicable', 'Privileged Access Management vault covers corporate IT only; OT vendor accounts are provisioned locally by design pending PAM extension project OT-PAM-2027.', 'not_applicable', u_cyber, 'not_tested', 'Tracked as a separate initiative, out of scope for this assessment.');

  -- Actions for the flagship risk (exact owners/dates from the scenario)
  insert into actions (risk_id, assessment_id, description, owner_id, department_id, priority, target_date, status, completion_date, comments, created_by) values
  (rid, aid, 'Review all vendor remote access accounts and disable/rotate credentials for inactive vendors', u_cyber, dep_cyber, 'high', date '2026-09-30', 'completed', date '2026-09-28', 'Reviewed 14 vendor accounts; 5 disabled, remaining rotated to time-boxed credentials.', u_assessor);

  insert into actions (risk_id, assessment_id, description, owner_id, department_id, priority, target_date, status, created_by) values
  (rid, aid, 'Restrict remote access window to approved maintenance hours with pre-approval workflow', u_ot, dep_ot, 'medium', date '2026-10-15', 'in_progress', u_assessor);

  -- Risk 2 (same assessment, additional realism)
  insert into risks (assessment_id, title, cause, event, consequence_text, category_id, source, threat, vulnerability,
    consequence, affected_asset_id, affected_process, existing_controls_text,
    inherent_likelihood, inherent_impact, residual_likelihood, residual_impact, treatment, owner_id, created_by)
  values (aid, 'Insufficient network segmentation between DMZ and Level 2',
    'firewall rules between the DMZ and Level 2 supervisory network are broader than required',
    'malware or an attacker pivots from a compromised DMZ host directly into the SCADA/HMI layer',
    'spread of malware into supervisory systems and possible loss of operator visibility',
    cat_network, 'Internal network architecture', 'Lateral movement following DMZ compromise', 'Overly permissive firewall rule set, not reviewed in 18 months',
    'Loss of HMI visibility, potential process upset', ast_dcs1, 'Crude Distillation',
    'OT firewall at DMZ boundary; VLAN segmentation',
    3, 4, 2, 3, 'mitigate', u_cyber, u_assessor)
  returning id into rid;

  insert into actions (risk_id, assessment_id, description, owner_id, department_id, priority, target_date, status, completion_date, created_by) values
  (rid, aid, 'Conduct firewall rule-base review and remove/tighten overly permissive DMZ-to-L2 rules', u_cyber, dep_cyber, 'high', date '2026-10-01', 'completed', date '2026-09-25', u_assessor);

  -- Risk 3 — accepted risk (exercises the Accept treatment path)
  insert into risks (assessment_id, title, cause, event, consequence_text, category_id, source, threat, vulnerability,
    consequence, affected_asset_id, affected_process, existing_controls_text,
    inherent_likelihood, inherent_impact, residual_likelihood, residual_impact, treatment,
    acceptance_justification, acceptance_authority, acceptance_date, owner_id, created_by)
  values (aid, 'Legacy engineering workstation running unsupported OS',
    'the DCS vendor has not yet certified a supported OS upgrade path for this workstation model',
    'the legacy OS on the engineering workstation lacks vendor security patches',
    'an unpatched vulnerability on the workstation is exploited',
    cat_patch, 'Vendor lifecycle constraint', 'Exploitation of unpatched OS vulnerability', 'End-of-life operating system, no vendor patch path until 2027 upgrade project',
    'Potential compromise of engineering workstation used to program the DCS', ast_ews1, 'Crude Distillation',
    'Network isolation; application whitelisting; no internet access',
    2, 4, 2, 3, 'accept',
    'Compensating controls (network isolation, whitelisting, no internet access) reduce residual likelihood; vendor-certified OS upgrade is scheduled for the 2027 turnaround.',
    'Khalid Al-Saidi, Director OT Cybersecurity', date '2026-09-05', u_ot, u_assessor)
  returning id into rid;

  -- Evidence for the flagship assessment
  insert into evidence (file_name, storage_path, evidence_type, description, uploaded_by, assessment_id, risk_id) values
  ('VPN_Config_Export_2026-08.pdf', 'evidence/RA-2026-DCS/VPN_Config_Export_2026-08.pdf', 'Configuration Export', 'VPN gateway configuration export showing split-tunneling disabled and MFA enforcement.', u_cyber, aid, null);
  insert into evidence (file_name, storage_path, evidence_type, description, uploaded_by, assessment_id) values
  ('Vendor_Access_Review_2026-09.xlsx', 'evidence/RA-2026-DCS/Vendor_Access_Review_2026-09.xlsx', 'Report', 'Vendor account review spreadsheet used to identify accounts for disablement.', u_cyber, aid);
  insert into evidence (file_name, storage_path, evidence_type, description, uploaded_by, assessment_id, participant_id) values
  ('Workshop_Meeting_Minutes_2026-08-12.pdf', 'evidence/RA-2026-DCS/Workshop_Meeting_Minutes_2026-08-12.pdf', 'Meeting Minutes', 'Risk identification workshop minutes.', u_assessor, aid, (select id from assessment_participants where assessment_id = aid and name = 'Maryam Al-Lawati'));

  -- Approval workflow — full chain to Completed
  insert into approvals (assessment_id, step, reviewer_id, action, comments) values
  (aid, 'submitted', u_assessor, 'submit', 'Assessment complete, submitting for review.');
  insert into approvals (assessment_id, step, reviewer_id, action, comments) values
  (aid, 'risk_manager_review', u_rm, 'approve', 'Risk ratings and treatment plans are appropriate.');
  insert into approvals (assessment_id, step, reviewer_id, action, comments) values
  (aid, 'process_owner_review', u_po, 'approve', 'Operational impact accurately reflected; concur with action plan.');
  insert into approvals (assessment_id, step, reviewer_id, action, comments) values
  (aid, 'approver_review', u_approver, 'approve', 'Approved. Residual risk acceptable with the two open actions tracked to closure.');

  ----------------------------------------------------------------------------
  -- Two prior-year re-assessments of the SAME real-world risk (lineage_key)
  -- to power the risk trend chart per the section 27 example: 2024 Critical
  -- 20 -> 2025 High 15 -> 2026 Medium 8 (2026 is the flagship risk above).
  ----------------------------------------------------------------------------
  insert into assessments (title, type, status, asset_id, asset_id_text, business_unit_id, location,
    process_owner_id, assessment_owner_id, assessment_date, due_date, completion_date, reason_for_assessment,
    description, objective, scope_in, business_process, created_by)
  values ('DCS Remote Access Risk Assessment — 2024 Review', 'light', 'completed', ast_dcs1, 'DCS-001', bu_refining, 'Refinery Site A',
    u_po, u_assessor, date '2024-09-05', date '2024-09-20', date '2024-09-18', 'Periodic review of vendor remote access risk.',
    'Baseline assessment prior to VPN/MFA remediation program.', 'Assess vendor remote access risk to DCS-001.', 'Vendor remote access path.', 'Crude Distillation', u_assessor)
  returning id into aid;
  insert into risks (assessment_id, lineage_key, title, cause, event, consequence_text, category_id,
    threat, vulnerability, consequence, affected_asset_id, existing_controls_text,
    inherent_likelihood, inherent_impact, residual_likelihood, residual_impact, treatment, owner_id, created_by)
  values (aid, 'DCS-001-REMOTE-ACCESS', 'Unauthorized vendor remote access',
    'vendor remote access was permitted without MFA or session logging',
    'an unauthorized party gains remote access to the DCS',
    'loss of process control', cat_remote, 'Compromised vendor credentials', 'No MFA, no session logging, shared accounts',
    'Loss of view/control of DCS', ast_dcs1, 'Shared VPN accounts, no MFA', 4, 5, 4, 5, 'mitigate', u_ot, u_assessor);
  insert into approvals (assessment_id, step, reviewer_id, action, comments) values (aid, 'approver_review', u_approver, 'approve', 'Approved with remediation program initiated.');

  insert into assessments (title, type, status, asset_id, asset_id_text, business_unit_id, location,
    process_owner_id, assessment_owner_id, assessment_date, due_date, completion_date, reason_for_assessment,
    description, objective, scope_in, business_process, created_by)
  values ('DCS Remote Access Risk Assessment — 2025 Review', 'light', 'completed', ast_dcs1, 'DCS-001', bu_refining, 'Refinery Site A',
    u_po, u_assessor, date '2025-09-08', date '2025-09-20', date '2025-09-19', 'Periodic review of vendor remote access risk.',
    'Follow-up assessment after MFA rollout; VPN hardening still in progress.', 'Assess vendor remote access risk to DCS-001.', 'Vendor remote access path.', 'Crude Distillation', u_assessor)
  returning id into aid;
  insert into risks (assessment_id, lineage_key, title, cause, event, consequence_text, category_id,
    threat, vulnerability, consequence, affected_asset_id, existing_controls_text,
    inherent_likelihood, inherent_impact, residual_likelihood, residual_impact, treatment, owner_id, created_by)
  values (aid, 'DCS-001-REMOTE-ACCESS', 'Unauthorized vendor remote access',
    'vendor account review cadence still inconsistent despite MFA rollout',
    'an unauthorized party gains remote access to the DCS',
    'loss of process control', cat_remote, 'Compromised vendor credentials', 'MFA implemented; account review still ad-hoc',
    'Loss of view/control of DCS', ast_dcs1, 'MFA implemented; session logging partially implemented', 3, 5, 3, 5, 'mitigate', u_ot, u_assessor);
  insert into approvals (assessment_id, step, reviewer_id, action, comments) values (aid, 'approver_review', u_approver, 'approve', 'Approved; further hardening tracked into 2026 review.');

  ----------------------------------------------------------------------------
  -- FLAGSHIP #2 — SCADA / Historian assessment, mid-approval
  ----------------------------------------------------------------------------
  insert into assessments (title, type, status, asset_id, asset_id_text, business_unit_id, location,
    process_owner_id, assessment_owner_id, assessment_date, due_date, reason_for_assessment, description, objective,
    scope_in, scope_out, business_process, ot_environment, methodology, start_date, end_date, created_by)
  values ('SCADA Historian Data Integrity Assessment', 'full', 'approver_review', ast_scada1, 'SCADA-001', bu_pipeline, 'Pipeline Control Center',
    u_po, u_cyber, date '2026-07-02', date '2026-08-15', 'Concerns raised over historian data integrity following a vendor patch.',
    'Assessment of data integrity and monitoring controls across the pipeline SCADA and historian.', 'Ensure historian data integrity risks are identified and treated.',
    'Pipeline SCADA, Historian server, PI-to-SCADA interface.', 'Corporate BI reporting layer.', 'Pipeline Operations', 'Production', 'Qualitative 5x5 risk matrix', date '2026-07-02', date '2026-08-10', u_cyber)
  returning id, assessment_code into aid, acode;

  insert into assessment_participants (assessment_id, name, job_title, department, organization, role_in_assessment, email, participation_type, date_participated) values
  (aid, 'Ahmed Al-Riyami', 'OT Risk Assessor', 'OT Engineering', 'Refinery Site A', 'Facilitator', 'assessor@otrisk.local', 'workshop', date '2026-07-05'),
  (aid, 'Layla Al-Harthi', 'Program Manager', 'OT Cybersecurity', 'Refinery Site A', 'Sponsor', 'admin@otrisk.local', 'approval', date '2026-07-05');

  insert into risks (assessment_id, title, cause, event, consequence_text, category_id, threat, vulnerability, consequence,
    affected_asset_id, existing_controls_text, inherent_likelihood, inherent_impact, residual_likelihood, residual_impact, treatment, owner_id, created_by)
  values
  (aid, 'Unmonitored write access to historian tags', 'historian write permissions were not reviewed after the last vendor patch',
   'an unauthorized change to historian tag configuration goes undetected', 'inaccurate production and compliance reporting',
   cat_monitor, 'Insider or compromised account', 'No change alerting on tag configuration', 'Misleading operational and compliance data',
   ast_hist, 'SIEM ingesting OS logs only', 3, 3, 2, 3, 'mitigate', u_cyber, u_cyber),
  (aid, 'SCADA-to-Historian interface running outdated middleware', 'the PI interface software has not been updated in over 24 months',
   'the outdated interface is exploited to inject false data', 'loss of trust in production data used for regulatory reporting',
   cat_patch, 'Unpatched middleware vulnerability', 'Interface software 2 major versions behind vendor support', 'False data injection, reporting integrity loss',
   ast_hist, 'Network segmentation only', 3, 4, 2, 3, 'mitigate', u_cyber, u_cyber);

  insert into risks (assessment_id, title, cause, event, consequence_text, category_id, threat, vulnerability, consequence,
    affected_asset_id, existing_controls_text, inherent_likelihood, inherent_impact, residual_likelihood, residual_impact, treatment, owner_id, created_by)
  values
  (aid, 'No automated backup verification for historian archive', 'backup jobs are monitored for completion but restorability is not tested',
   'a corrupted backup is discovered only during an actual recovery attempt', 'permanent loss of historical production data',
   cat_backup, 'Backup corruption', 'Restore testing not performed', 'Loss of historical production/compliance data',
   ast_hist, 'Nightly backup job with completion alerting', 2, 3, 2, 2, 'mitigate', u_ot, u_cyber)
  returning id into rid; -- rid now holds the last inserted risk id (backup risk)

  insert into approvals (assessment_id, step, reviewer_id, action, comments) values
  (aid, 'submitted', u_cyber, 'submit', 'Submitting for review.'),
  (aid, 'risk_manager_review', u_rm, 'approve', 'Concur with ratings.'),
  (aid, 'process_owner_review', u_po, 'approve', 'Concur with operational impact.');

  insert into evidence (file_name, storage_path, evidence_type, description, uploaded_by, assessment_id) values
  ('Historian_Permission_Export.csv', 'evidence/RA-2026-SCADA/Historian_Permission_Export.csv', 'Configuration Export', 'Exported historian tag write-permission list.', u_cyber, aid),
  ('PI_Interface_Version_Report.pdf', 'evidence/RA-2026-SCADA/PI_Interface_Version_Report.pdf', 'Report', 'Version and support-status report for the PI interface.', u_cyber, aid);

  ----------------------------------------------------------------------------
  -- FLAGSHIP #3 — Light assessment, in progress
  ----------------------------------------------------------------------------
  insert into assessments (title, type, status, asset_id, asset_id_text, business_unit_id, location,
    process_owner_id, assessment_owner_id, assessment_date, due_date, reason_for_assessment, description, objective, scope_in, business_process, created_by)
  values ('Tank Farm PLC Patch Management Assessment', 'light', 'in_progress', ast_plc3, 'PLC-103', bu_refining, 'Tank Farm B',
    u_po, u_assessor, date '2026-09-01', date '2026-09-30', 'Vendor released a critical firmware patch for the tank farm PLC.',
    'Light assessment of risk associated with applying (or deferring) the vendor firmware patch.',
    'Determine treatment for the outstanding PLC firmware patch.', 'Tank Farm PLC-103 firmware and patch process.', 'Storage & Loading', u_assessor)
  returning id, assessment_code into aid, acode;

  insert into assessment_participants (assessment_id, name, job_title, department, organization, role_in_assessment, email, participation_type, date_participated) values
  (aid, 'Maryam Al-Lawati', 'OT Engineer', 'OT Engineering', 'Refinery Site A', 'SME', 'ot.engineer@otrisk.local', 'interview', date '2026-09-02');

  insert into risks (assessment_id, title, cause, event, consequence_text, category_id, threat, vulnerability, consequence,
    affected_asset_id, existing_controls_text, inherent_likelihood, inherent_impact, residual_likelihood, residual_impact, treatment, owner_id, created_by)
  values
  (aid, 'Unpatched PLC firmware vulnerability', 'the critical firmware patch released 45 days ago has not yet been applied',
   'a known firmware vulnerability is exploited', 'loss of control over tank farm loading operations',
   cat_patch, 'Exploitation of published CVE', 'Firmware patch not yet applied', 'Loss of control of tank farm loading',
   ast_plc3, 'Network segmentation; no direct internet access', 3, 4, 2, 3, 'mitigate', u_ot, u_assessor),
  (aid, 'Patch testing delay due to lack of offline test rig', 'there is no offline test rig to validate patches before production deployment',
   'a patch is deployed without adequate testing and causes a process disruption', 'unplanned downtime',
   cat_patch, 'Inadequate change testing', 'No dedicated test environment', 'Unplanned process downtime',
   ast_plc3, 'Change management process', 2, 3, 2, 2, 'mitigate', u_ot, u_assessor);

  ----------------------------------------------------------------------------
  -- FLAGSHIP #4 — Third-party privileged access, pending approval
  ----------------------------------------------------------------------------
  insert into assessments (title, type, status, asset_id, asset_id_text, business_unit_id, location,
    process_owner_id, assessment_owner_id, assessment_date, due_date, reason_for_assessment, description, objective,
    scope_in, business_process, ot_environment, methodology, start_date, end_date, created_by)
  values ('Third-Party Vendor Privileged Access Assessment', 'full', 'pending_approval', ast_srv, 'SRV-001', bu_refining, 'Refinery Site A',
    u_po, u_cyber, date '2026-08-20', date '2026-09-20', 'Annual third-party access governance review.',
    'Assessment of privileged access granted to third-party integrators on the OT domain controller and jump hosts.',
    'Ensure third-party privileged access is time-boxed, monitored and least-privilege.',
    'OT domain controller, jump hosts, third-party service accounts.', 'Identity & Access', 'Production', 'Qualitative 5x5 risk matrix', date '2026-08-20', date '2026-09-12', u_cyber)
  returning id, assessment_code into aid, acode;

  insert into assessment_participants (assessment_id, name, job_title, department, organization, role_in_assessment, email, participation_type, date_participated) values
  (aid, 'Yousuf Al-Balushi', 'OT Cybersecurity Engineer', 'OT Cybersecurity', 'Refinery Site A', 'Facilitator', 'cyber.engineer@otrisk.local', 'workshop', date '2026-08-22'),
  (aid, 'Sara Al-Hinai', 'Internal Auditor', 'OT Cybersecurity', 'Refinery Site A', 'Observer', 'auditor@otrisk.local', 'technical_review', date '2026-08-22');

  insert into risks (assessment_id, title, cause, event, consequence_text, category_id, threat, vulnerability, consequence,
    affected_asset_id, existing_controls_text, inherent_likelihood, inherent_impact, residual_likelihood, residual_impact, treatment, owner_id, created_by)
  values
  (aid, 'Standing privileged accounts for third-party integrators', 'third-party service accounts were provisioned with permanent domain admin rights',
   'a compromised third-party credential is used to move laterally across the OT domain', 'domain-wide compromise of OT identity infrastructure',
   cat_thirdparty, 'Compromised third-party credential', 'Standing (non-expiring) privileged accounts', 'Domain-wide compromise',
   ast_srv, 'Domain logging only', 4, 5, 2, 4, 'mitigate', u_cyber, u_cyber),
  (aid, 'No formal offboarding process for departed vendor staff', 'vendor staff changes are not consistently communicated to OT cybersecurity',
   'a departed vendor employee retains valid credentials', 'unauthorized access by a former vendor employee',
   cat_thirdparty, 'Former employee retains access', 'No automated offboarding trigger', 'Unauthorized access',
   ast_srv, 'Manual quarterly account review', 3, 4, 2, 3, 'mitigate', u_cyber, u_cyber),
  (aid, 'Shared jump host credentials across multiple vendors', 'the jump host was configured with a small pool of shared local accounts',
   'actions by one vendor cannot be attributed, and a compromised shared credential grants broad access', 'loss of accountability and broad unauthorized access',
   cat_access, 'Shared credential compromise', 'Shared local accounts on jump host', 'Loss of accountability, broad access',
   ast_srv, 'Jump host network isolation', 3, 4, 2, 3, 'mitigate', u_cyber, u_cyber);

  insert into approvals (assessment_id, step, reviewer_id, action, comments) values
  (aid, 'submitted', u_cyber, 'submit', 'Submitting for risk manager review.'),
  (aid, 'risk_manager_review', u_rm, 'approve', 'Findings are consistent with the audit observations.');

  ----------------------------------------------------------------------------
  -- Padding assessments generated from realistic OT topics (draft/varied
  -- status) to reach the section 41 sample-data targets.
  ----------------------------------------------------------------------------
  for i in 1..array_length(topics, 1) loop
    insert into assessments (title, type, status, asset_id_text, business_unit_id, location,
      process_owner_id, assessment_owner_id, assessment_date, due_date, reason_for_assessment, description, objective, business_process, created_by)
    values (
      topics[i][1], topics[i][2]::assessment_type,
      (array['draft','in_progress','pending_approval'])[1 + (i % 3)]::assessment_status,
      topics[i][3], bu_refining, 'Refinery Site A',
      u_po, (array[u_assessor, u_cyber])[1 + (i % 2)], current_date - (i * 5), current_date + (30 - i * 3),
      'Scheduled periodic OT risk review.', 'Generated sample assessment covering ' || topics[i][1] || '.',
      'Identify and treat risks within scope.', 'General Operations', u_assessor
    )
    returning id, assessment_code into aid, acode;

    risk_titles := array[
      'Weak default credentials on field devices',
      'Missing security monitoring coverage for this asset',
      'Unrestricted USB media use on engineering laptops',
      'Configuration drift from approved baseline',
      'Delayed vulnerability remediation past SLA'
    ];

    for j in 1..(3 + (i % 3)) loop
      cause_txt := (array[
        'a compensating control was not consistently applied',
        'monitoring coverage was not extended to this asset during the last upgrade',
        'the control was not enforced through policy at the time of deployment'
      ])[1 + (j % 3)];
      event_txt := lower(risk_titles[1 + ((i + j) % array_length(risk_titles, 1))]);
      conseq_txt := (array[
        'a localized process disruption',
        'delayed detection of a security incident',
        'increased attack surface for the affected asset'
      ])[1 + (j % 3)];
      inh_l := 2 + (j % 3); inh_i := 2 + ((i + j) % 3);
      res_l := greatest(1, inh_l - 1); res_i := greatest(1, inh_i - 1);
      treat := (array['mitigate','mitigate','mitigate','accept'])[1 + (j % 4)];

      insert into risks (assessment_id, title, cause, event, consequence_text, category_id, threat, vulnerability,
        consequence, existing_controls_text, inherent_likelihood, inherent_impact, residual_likelihood, residual_impact,
        treatment, acceptance_justification, acceptance_authority, acceptance_date, owner_id, created_by)
      values (
        aid, risk_titles[1 + ((i + j) % array_length(risk_titles, 1))], cause_txt, event_txt, conseq_txt,
        (array[cat_config, cat_monitor, cat_access, cat_malware, cat_physical])[1 + (j % 5)],
        'Identified during ' || topics[i][1], 'See risk description', initcap(conseq_txt),
        'Partial compensating controls in place', inh_l, inh_i, res_l, res_i, treat,
        case when treat = 'accept' then 'Residual risk within organizational risk appetite; monitored quarterly.' else null end,
        case when treat = 'accept' then 'Omar Al-Balushi, OT Risk Manager' else null end,
        case when treat = 'accept' then current_date else null end,
        (array[u_ot, u_cyber])[1 + (j % 2)], u_assessor
      ) returning id into rid;

      if treat = 'mitigate' then
        act_target := current_date + ((j % 5) * 7 - 14);
        act_status := (array['open','in_progress','completed','open','in_progress'])[1 + (j % 5)];
        insert into actions (risk_id, assessment_id, description, owner_id, department_id, priority, target_date, status, completion_date, created_by)
        values (
          rid, aid, 'Remediate: ' || initcap(event_txt),
          (array[u_ot, u_cyber])[1 + (j % 2)], (array[dep_ot, dep_cyber])[1 + (j % 2)],
          (array['critical','high','medium','low'])[1 + (j % 4)]::action_priority,
          act_target, act_status,
          case when act_status = 'completed' then act_target - 2 else null end,
          u_assessor
        ) returning id into aid_action;
      end if;
    end loop;

    if i = 1 then
      insert into evidence (file_name, storage_path, evidence_type, description, uploaded_by, assessment_id) values
      ('Firewall_Rulebase_Export.xlsx', 'evidence/' || acode || '/Firewall_Rulebase_Export.xlsx', 'Configuration Export', 'Exported firewall rule base for review.', u_cyber, aid);
    end if;
    if i = 2 then
      insert into assessment_participants (assessment_id, name, job_title, department, organization, role_in_assessment, email, participation_type, date_participated) values
      (aid, 'Ahmed Al-Riyami', 'OT Risk Assessor', 'OT Engineering', 'Refinery Site A', 'Facilitator', 'assessor@otrisk.local', 'workshop', current_date - 3);
    end if;
  end loop;

  ----------------------------------------------------------------------------
  -- Top-up: every risk with treatment='mitigate' gets at least one action
  -- (covers the flagship SCADA/PLC/third-party risks above), plus a second
  -- action on higher-severity risks, to reach the section 41 volume target.
  ----------------------------------------------------------------------------
  insert into actions (risk_id, assessment_id, description, owner_id, department_id, priority, target_date, status, created_by)
  select r.id, r.assessment_id,
    'Implement mitigating control for: ' || r.title,
    coalesce(r.owner_id, u_ot),
    coalesce((select department_id from profiles where id = r.owner_id), dep_ot),
    (case when r.inherent_score >= 17 then 'critical' when r.inherent_score >= 10 then 'high'
         when r.inherent_score >= 5 then 'medium' else 'low' end)::action_priority,
    current_date + (10 + (('x' || substr(md5(r.id::text), 1, 6))::bit(24)::int % 60)),
    (array['open','in_progress'])[1 + (('x' || substr(md5(r.id::text), 7, 6))::bit(24)::int % 2)]::action_status,
    u_assessor
  from risks r
  where r.treatment = 'mitigate'
    and not exists (select 1 from actions a where a.risk_id = r.id);

  insert into actions (risk_id, assessment_id, description, owner_id, department_id, priority, target_date, status, created_by)
  select r.id, r.assessment_id,
    'Verify effectiveness of implemented control for: ' || r.title,
    coalesce(r.owner_id, u_cyber), dep_cyber, 'medium'::action_priority,
    current_date + (20 + (('x' || substr(md5(r.id::text || 'v'), 1, 6))::bit(24)::int % 40)),
    'open'::action_status, u_rm
  from risks r
  where r.treatment = 'mitigate' and r.inherent_score >= 5
    and (select count(*) from actions a where a.risk_id = r.id) < 2;

  ----------------------------------------------------------------------------
  -- Top-up: ensure every assessment has at least 2 participants and 2
  -- evidence items so the Evidence Repository and Participants views are
  -- populated across the full sample set, not just the flagship records.
  ----------------------------------------------------------------------------
  insert into assessment_participants (assessment_id, name, job_title, department, organization, role_in_assessment, email, participation_type, date_participated, comments)
  select a.id, x.name, x.job_title, x.department, 'Refinery Site A', x.role_in_assessment, x.email, x.ptype::participation_type, a.assessment_date, x.comments
  from assessments a
  cross join lateral (
    values
      ('Ahmed Al-Riyami', 'OT Risk Assessor', 'OT Engineering', 'Facilitator', 'assessor@otrisk.local', 'workshop', 'Facilitated risk identification session.'),
      ('Sara Al-Hinai', 'Internal Auditor', 'OT Cybersecurity', 'Observer', 'auditor@otrisk.local', 'technical_review', 'Observed for audit trail purposes.')
  ) as x(name, job_title, department, role_in_assessment, email, ptype, comments)
  where (select count(*) from assessment_participants p where p.assessment_id = a.id) < 2;

  insert into evidence (file_name, storage_path, evidence_type, description, uploaded_by, assessment_id)
  select x.suffix, 'evidence/' || a.assessment_code || '/' || x.suffix, x.etype, x.descr, u_assessor, a.id
  from assessments a
  cross join lateral (
    values
      ('Risk_Register_Extract.xlsx', 'Report', 'Risk register extract generated for this assessment.'),
      ('Assessment_Notes.pdf', 'Meeting Minutes', 'Consolidated assessment working notes.')
  ) as x(suffix, etype, descr)
  where (select count(*) from evidence e where e.assessment_id = a.id) < 2;

  ----------------------------------------------------------------------------
  -- A handful of extension requests on open actions (section 22)
  ----------------------------------------------------------------------------
  insert into action_extensions (action_id, current_target_date, requested_target_date, reason, risk_impact, compensating_controls, requested_by, approval_authority, approval_status)
  select id, target_date, target_date + 21, 'Vendor parts lead time longer than expected.', 'Residual risk remains Medium during the extension window.', 'Enhanced monitoring in place during the delay.', owner_id, u_rm, 'pending'
  from actions where status = 'in_progress' limit 3;

  update action_extensions set approval_status = 'approved', decided_by = u_rm, decided_at = now(), decision_comments = 'Approved given compensating monitoring controls.'
  where id = (select id from action_extensions order by created_at limit 1);

  ----------------------------------------------------------------------------
  -- Evidence: participant-session artifacts (meeting minutes / attendance)
  ----------------------------------------------------------------------------
  insert into evidence (file_name, storage_path, evidence_type, description, uploaded_by, participant_id)
  select 'Attendance_Sheet_' || to_char(p.date_participated, 'YYYYMMDD') || '.pdf',
         'evidence/participants/Attendance_Sheet_' || p.id || '.pdf',
         'Attendance Sheet', 'Signed attendance sheet for ' || p.participation_type::text || ' session.', u_assessor, p.id
  from assessment_participants p
  order by p.created_at
  limit 8;

  ----------------------------------------------------------------------------
  -- Refresh actions.status to 'overdue' for any that are now past due, so the
  -- raw column matches the computed v_actions.effective_status on first load.
  ----------------------------------------------------------------------------
  update actions set status = 'overdue'
  where status not in ('completed','cancelled','on_hold') and target_date < current_date;

end $$;

-- Sample notifications for the demo Risk Manager
insert into notifications (user_id, type, title, message, related_object_type, related_object_id, is_read)
select (select id from profiles where email='risk.manager@otrisk.local'), 'action_overdue',
  'Action overdue: ' || action_code, description || ' is now overdue.', 'action', id::text, false
from actions where status = 'overdue' limit 5;

insert into notifications (user_id, type, title, message, related_object_type, related_object_id, is_read)
select (select id from profiles where email='approver@otrisk.local'), 'assessment_approved',
  'Assessment approved: ' || assessment_code, title || ' has been approved and completed.', 'assessment', id::text, true
from assessments where status = 'completed' limit 3;
