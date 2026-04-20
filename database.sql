drop table if exists attendance_records cascade;
drop table if exists attendance_sessions cascade;
drop table if exists fees cascade;
drop table if exists schedules cascade;
drop table if exists class_students cascade;
drop table if exists classes cascade;
drop table if exists students cascade;

create table students (
  id uuid primary key,
  surname text not null,
  last_name text not null,
  gender text not null,
  dob date not null,
  father_name text not null,
  father_phone text not null,
  father_occupation text not null,
  mother_name text not null,
  mother_phone text not null,
  mother_occupation text not null,
  school_name text not null,
  school_class text not null,
  email text,
  level integer not null default 1,
  created_at timestamptz not null default now()
);

create table classes (
  id uuid primary key,
  name text not null,
  level integer not null default 1,
  notes text,
  created_at timestamptz not null default now()
);

create table class_students (
  class_id uuid not null references classes(id) on delete cascade,
  student_id uuid not null references students(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (class_id, student_id)
);

create table attendance_sessions (
  id uuid primary key,
  class_id uuid not null references classes(id) on delete cascade,
  attendance_date date not null,
  created_at timestamptz not null default now(),
  unique (class_id, attendance_date)
);

create table attendance_records (
  session_id uuid not null references attendance_sessions(id) on delete cascade,
  student_id uuid not null references students(id) on delete cascade,
  status text not null check (status in ('Present', 'Absent')),
  created_at timestamptz not null default now(),
  primary key (session_id, student_id)
);

create table fees (
  id uuid primary key,
  student_id uuid not null references students(id) on delete cascade,
  batch_id uuid references classes(id) on delete set null,
  level integer not null default 1,
  amount numeric(10, 2) not null check (amount >= 0),
  dues numeric(10, 2) not null default 0 check (dues >= 0),
  payment_mode text,
  comments text,
  payment_date date not null,
  created_at timestamptz not null default now()
);

create table schedules (
  id uuid primary key,
  class_id uuid not null references classes(id) on delete cascade,
  level integer not null default 1,
  day text not null,
  venue text not null,
  from_time text not null,
  to_time text not null,
  message text not null,
  created_at timestamptz not null default now()
);

alter table students enable row level security;
alter table classes enable row level security;
alter table class_students enable row level security;
alter table attendance_sessions enable row level security;
alter table attendance_records enable row level security;
alter table fees enable row level security;
alter table schedules enable row level security;

create policy "students_select" on students for select using (true);
create policy "students_insert" on students for insert with check (true);
create policy "students_update" on students for update using (true);
create policy "students_delete" on students for delete using (true);

create policy "classes_select" on classes for select using (true);
create policy "classes_insert" on classes for insert with check (true);
create policy "classes_update" on classes for update using (true);
create policy "classes_delete" on classes for delete using (true);

create policy "class_students_select" on class_students for select using (true);
create policy "class_students_insert" on class_students for insert with check (true);
create policy "class_students_delete" on class_students for delete using (true);

create policy "attendance_sessions_select" on attendance_sessions for select using (true);
create policy "attendance_sessions_insert" on attendance_sessions for insert with check (true);
create policy "attendance_sessions_update" on attendance_sessions for update using (true);
create policy "attendance_sessions_delete" on attendance_sessions for delete using (true);

create policy "attendance_records_select" on attendance_records for select using (true);
create policy "attendance_records_insert" on attendance_records for insert with check (true);
create policy "attendance_records_update" on attendance_records for update using (true);
create policy "attendance_records_delete" on attendance_records for delete using (true);

create policy "fees_select" on fees for select using (true);
create policy "fees_insert" on fees for insert with check (true);
create policy "fees_update" on fees for update using (true);
create policy "fees_delete" on fees for delete using (true);

create policy "schedules_select" on schedules for select using (true);
create policy "schedules_insert" on schedules for insert with check (true);
create policy "schedules_update" on schedules for update using (true);
create policy "schedules_delete" on schedules for delete using (true);

insert into students (id, surname, last_name, gender, dob, father_name, father_phone, father_occupation, mother_name, mother_phone, mother_occupation, school_name, school_class, email, level)
values
  ('11111111-1111-1111-1111-111111111111', 'Reddy', 'Ananya', 'Female', '2015-04-14', 'Mahesh Reddy', '9876543210', 'Teacher', 'Swathi Reddy', '9123456780', 'Homemaker', 'Kakatiya School', '5', 'ananya@example.com', 1),
  ('22222222-2222-2222-2222-222222222222', 'Kumar', 'Vihaan', 'Male', '2014-09-18', 'Ravi Kumar', '9988776655', 'Engineer', 'Suma Kumar', '9000011111', 'Teacher', 'Kakatiya School', '6', 'vihaan@example.com', 1),
  ('33333333-3333-3333-3333-333333333333', 'Sharma', 'Aarav', 'Male', '2013-12-01', 'Rohit Sharma', '9555544444', 'Doctor', 'Pooja Sharma', '9444433333', 'Accountant', 'Springdale School', '7', 'aarav@example.com', 2),
  ('44444444-4444-4444-4444-444444444444', 'Patel', 'Mira', 'Female', '2014-02-11', 'Jignesh Patel', '9333322222', 'Business', 'Rina Patel', '9222211111', 'Designer', 'Springdale School', '6', 'mira@example.com', 2);

insert into classes (id, name, level, notes)
values
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Level 1 - 10am Kakatiya', 1, 'Weekend beginners batch'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Level 2 - 12pm Kakatiya', 2, 'Intermediate batch');

insert into class_students (class_id, student_id)
values
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '22222222-2222-2222-2222-222222222222'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '33333333-3333-3333-3333-333333333333'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '44444444-4444-4444-4444-444444444444');

insert into attendance_sessions (id, class_id, attendance_date)
values
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', current_date);

insert into attendance_records (session_id, student_id, status)
values
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', '11111111-1111-1111-1111-111111111111', 'Present'),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', '22222222-2222-2222-2222-222222222222', 'Absent');

insert into fees (id, student_id, batch_id, level, amount, dues, payment_mode, comments, payment_date)
values
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', '11111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 1, 1500, 250, 'Cash', 'Part payment', current_date),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '33333333-3333-3333-3333-333333333333', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 2, 1800, 0, 'UPI', 'Paid in full', current_date);

insert into schedules (id, class_id, level, day, venue, from_time, to_time, message)
values
  ('ffffffff-ffff-ffff-ffff-ffffffffffff', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 1, 'Saturday', 'Kakatiya School', '10:00', '11:00', 'Attend UCMAS ABACUS Level 1 - 10am Kakatiya CLASS at 10:00 to 11:00 at Kakatiya School.'),
  ('99999999-9999-9999-9999-999999999999', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 2, 'Sunday', 'Our Home', '12:00', '13:00', 'Attend UCMAS ABACUS Level 2 - 12pm Kakatiya CLASS at 12:00 to 13:00 at Our Home.');
