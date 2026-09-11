-- ============================================================================
-- OT Risk Management — Reporting views (0004)
-- Global Risk Register, Action Register (with computed overdue), Assessment
-- Inventory, and dashboard aggregate helpers.
-- ============================================================================

create or replace view v_risks as
select
  r.id,
  r.risk_code,
  r.assessment_id,
  a.assessment_code,
  a.title as assessment_title,
  a.status as assessment_status,
  r.title as risk_title,
  r.risk_statement,
  ast.id as asset_id,
  ast.asset_code,
  ast.name as asset_name,
  rc.name as category_name,
  r.inherent_likelihood, r.inherent_impact, r.inherent_score,
  fn_risk_rating(r.inherent_score) as inherent_rating,
  fn_risk_color(r.inherent_score) as inherent_color,
  r.residual_likelihood, r.residual_impact, r.residual_score,
  fn_risk_rating(r.residual_score) as residual_rating,
  fn_risk_color(r.residual_score) as residual_color,
  case when r.inherent_score is not null and r.residual_score is not null and r.inherent_score > 0
    then round((1 - (r.residual_score::numeric / r.inherent_score::numeric)) * 100, 1)
    else null end as risk_reduction_pct,
  r.treatment,
  r.status,
  r.owner_id,
  owner.full_name as owner_name,
  a.business_unit_id,
  bu.name as business_unit_name,
  a.assessment_owner_id,
  r.lineage_key,
  r.created_at,
  r.updated_at,
  extract(year from a.assessment_date)::int as assessment_year
from risks r
join assessments a on a.id = r.assessment_id
left join assets ast on ast.id = r.affected_asset_id
left join risk_categories rc on rc.id = r.category_id
left join profiles owner on owner.id = r.owner_id
left join business_units bu on bu.id = a.business_unit_id
where r.is_deleted = false and a.is_deleted = false;

create or replace view v_actions as
select
  ac.id,
  ac.action_code,
  ac.risk_id,
  r.risk_code,
  r.title as risk_title,
  ac.assessment_id,
  a.assessment_code,
  ac.description,
  ac.owner_id,
  owner.full_name as owner_name,
  ac.department_id,
  d.name as department_name,
  ac.priority,
  ac.target_date,
  ac.completion_date,
  ac.comments,
  case
    when ac.status = 'completed' then 'completed'
    when ac.status = 'cancelled' then 'cancelled'
    when ac.status = 'on_hold' then 'on_hold'
    when ac.target_date < current_date then 'overdue'
    else ac.status::text
  end as effective_status,
  case when ac.status not in ('completed','cancelled') and ac.target_date < current_date
    then (current_date - ac.target_date) else 0 end as days_overdue,
  ac.created_at,
  ac.updated_at
from actions ac
join risks r on r.id = ac.risk_id
join assessments a on a.id = ac.assessment_id
left join profiles owner on owner.id = ac.owner_id
left join departments d on d.id = ac.department_id
where ac.is_deleted = false;

create or replace view v_assessment_inventory as
select
  a.id,
  a.assessment_code,
  a.title,
  a.type,
  a.status,
  ast.asset_code,
  ast.name as asset_name,
  bu.name as business_unit_name,
  owner.full_name as owner_name,
  a.assessment_date,
  a.completion_date,
  a.due_date,
  (select count(*) from risks r where r.assessment_id = a.id and r.is_deleted = false) as risk_count,
  (select max(r.inherent_score) from risks r where r.assessment_id = a.id and r.is_deleted = false) as highest_inherent_score,
  fn_risk_rating((select max(r.inherent_score) from risks r where r.assessment_id = a.id and r.is_deleted = false)) as highest_risk_rating,
  (a.status not in ('completed','approved','archived') and a.due_date is not null and a.due_date < current_date) as is_overdue,
  a.created_at
from assessments a
left join assets ast on ast.id = a.asset_id
left join business_units bu on bu.id = a.business_unit_id
left join profiles owner on owner.id = a.assessment_owner_id
where a.is_deleted = false;

-- Risk history / trend for risks sharing a lineage_key across periodic assessments
create or replace view v_risk_history as
select
  r.lineage_key,
  r.id as risk_id,
  r.risk_code,
  r.title,
  extract(year from a.assessment_date)::int as assessment_year,
  r.inherent_score,
  fn_risk_rating(r.inherent_score) as inherent_rating,
  r.residual_score,
  fn_risk_rating(r.residual_score) as residual_rating,
  a.assessment_date
from risks r
join assessments a on a.id = r.assessment_id
where r.lineage_key is not null and r.is_deleted = false
order by r.lineage_key, a.assessment_date;
