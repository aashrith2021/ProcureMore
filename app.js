const STORAGE_KEY = "primeboss-ucmas-manager-v2";
const AUTH_KEY = "primeboss-admin-session-v1";
const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "primeboss2026";
const SUPABASE_CONFIG = window.PRIMEBOSS_SUPABASE_CONFIG || {};
const hasSupabaseConfig = Boolean(SUPABASE_CONFIG.url && SUPABASE_CONFIG.anonKey && window.supabase);

const sampleData = createSampleData();

const state = {
  students: [],
  batches: [],
  attendance: [],
  payments: [],
  schedules: [],
  mode: hasSupabaseConfig ? "cloud" : "local",
  isAuthenticated: localStorage.getItem(AUTH_KEY) === "true",
  activeView: "homeView"
};

const supabaseClient = hasSupabaseConfig
  ? window.supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey)
  : null;

const elements = {
  loginScreen: document.querySelector("#loginScreen"),
  loginForm: document.querySelector("#loginForm"),
  loginUsername: document.querySelector("#loginUsername"),
  loginPassword: document.querySelector("#loginPassword"),
  loginError: document.querySelector("#loginError"),
  authStatus: document.querySelector("#authStatus"),
  logoutButton: document.querySelector("#logoutButton"),
  syncStatus: document.querySelector("#syncStatus"),
  toast: document.querySelector("#toast"),
  studentCount: document.querySelector("#studentCount"),
  batchCount: document.querySelector("#batchCount"),
  todayCount: document.querySelector("#todayCount"),
  homeDateTime: document.querySelector("#homeDateTime"),
  homeScheduleList: document.querySelector("#homeScheduleList"),
  views: document.querySelectorAll(".app-view"),
  viewButtons: document.querySelectorAll("[data-view-target]"),
  backToTopButton: document.querySelector("#backToTopButton"),
  studentForm: document.querySelector("#studentForm"),
  resetStudentForm: document.querySelector("#resetStudentForm"),
  batchForm: document.querySelector("#batchForm"),
  assignStudentForm: document.querySelector("#assignStudentForm"),
  combineBatchForm: document.querySelector("#combineBatchForm"),
  attendanceForm: document.querySelector("#attendanceForm"),
  paymentForm: document.querySelector("#paymentForm"),
  scheduleForm: document.querySelector("#scheduleForm"),
  studentList: document.querySelector("#studentList"),
  batchList: document.querySelector("#batchList"),
  paymentList: document.querySelector("#paymentList"),
  scheduleList: document.querySelector("#scheduleList"),
  attendanceStudents: document.querySelector("#attendanceStudents"),
  attendanceReviewList: document.querySelector("#attendanceReviewList"),
  attendanceLegend: document.querySelector("#attendanceLegend"),
  attendanceChart: document.querySelector("#attendanceChart"),
  attendanceBatch: document.querySelector("#attendanceBatch"),
  attendanceDate: document.querySelector("#attendanceDate"),
  attendanceDashboardBatch: document.querySelector("#attendanceDashboardBatch"),
  attendanceDashboardDate: document.querySelector("#attendanceDashboardDate"),
  attendanceTemplate: document.querySelector("#attendanceRowTemplate"),
  studentId: document.querySelector("#studentId"),
  studentSurname: document.querySelector("#studentSurname"),
  studentLastName: document.querySelector("#studentLastName"),
  studentGender: document.querySelector("#studentGender"),
  studentDob: document.querySelector("#studentDob"),
  fatherName: document.querySelector("#fatherName"),
  fatherPhone: document.querySelector("#fatherPhone"),
  fatherOccupation: document.querySelector("#fatherOccupation"),
  motherName: document.querySelector("#motherName"),
  motherPhone: document.querySelector("#motherPhone"),
  motherOccupation: document.querySelector("#motherOccupation"),
  schoolName: document.querySelector("#schoolName"),
  schoolClass: document.querySelector("#schoolClass"),
  emailId: document.querySelector("#emailId"),
  studentLevel: document.querySelector("#studentLevel"),
  studentBatch: document.querySelector("#studentBatch"),
  batchId: document.querySelector("#batchId"),
  batchName: document.querySelector("#batchName"),
  batchLevel: document.querySelector("#batchLevel"),
  batchNotes: document.querySelector("#batchNotes"),
  batchStudents: document.querySelector("#batchStudents"),
  batchSubmitButton: document.querySelector("#batchSubmitButton"),
  assignStudent: document.querySelector("#assignStudent"),
  assignBatch: document.querySelector("#assignBatch"),
  combineBatchSelection: document.querySelector("#combineBatchSelection"),
  combinedBatchName: document.querySelector("#combinedBatchName"),
  combinedBatchLevel: document.querySelector("#combinedBatchLevel"),
  paymentId: document.querySelector("#paymentId"),
  paymentStudent: document.querySelector("#paymentStudent"),
  paymentBatch: document.querySelector("#paymentBatch"),
  paymentLevel: document.querySelector("#paymentLevel"),
  paymentAmount: document.querySelector("#paymentAmount"),
  paymentDues: document.querySelector("#paymentDues"),
  paymentMode: document.querySelector("#paymentMode"),
  paymentComments: document.querySelector("#paymentComments"),
  paymentDate: document.querySelector("#paymentDate"),
  paymentSubmitButton: document.querySelector("#paymentSubmitButton"),
  paymentCheckStudent: document.querySelector("#paymentCheckStudent"),
  paymentCheckBatch: document.querySelector("#paymentCheckBatch"),
  paymentSummary: document.querySelector("#paymentSummary"),
  paymentHistoryList: document.querySelector("#paymentHistoryList"),
  scheduleId: document.querySelector("#scheduleId"),
  scheduleBatch: document.querySelector("#scheduleBatch"),
  scheduleLevel: document.querySelector("#scheduleLevel"),
  scheduleDay: document.querySelector("#scheduleDay"),
  scheduleVenue: document.querySelector("#scheduleVenue"),
  scheduleFromTime: document.querySelector("#scheduleFromTime"),
  scheduleToTime: document.querySelector("#scheduleToTime"),
  scheduleMessage: document.querySelector("#scheduleMessage"),
  scheduleSubmitButton: document.querySelector("#scheduleSubmitButton"),
  scheduleManagerList: document.querySelector("#scheduleManagerList"),
  studentSearch: document.querySelector("#studentSearch"),
  studentLevelFilter: document.querySelector("#studentLevelFilter"),
  batchSearch: document.querySelector("#batchSearch"),
  paymentStudentFilter: document.querySelector("#paymentStudentFilter"),
  paymentBatchFilter: document.querySelector("#paymentBatchFilter")
};

setDefaults();
bindEvents();
updateAuthUi();
updateActiveView();
handleWindowScroll();
init();

async function init() {
  elements.homeDateTime.textContent = new Intl.DateTimeFormat("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short"
  }).format(new Date());

  if (supabaseClient) {
    updateSyncStatus("Connecting to Supabase cloud database...", "pending");
    try {
      await loadCloudData();
      if (isStateEmpty()) {
        await seedCloudData();
        await loadCloudData();
      }
      updateSyncStatus("Cloud mode: data is loading from your Supabase database.", "good");
    } catch (error) {
      console.error("Supabase load failed, falling back to local storage.", error);
      hydrateState(loadLocalState());
      updateSyncStatus("Cloud setup could not load the new schema. The app switched back to browser sample data.", "warn");
    }
  } else {
    hydrateState(loadLocalState());
    updateSyncStatus("Demo mode: sample UCMAS records are saved in this browser. Add Supabase config to store them in a cloud database.", "neutral");
  }

  render();
}

function bindEvents() {
  elements.loginForm.addEventListener("submit", handleLogin);
  elements.logoutButton.addEventListener("click", handleLogout);
  elements.backToTopButton.addEventListener("click", handleBackToTop);
  elements.studentForm.addEventListener("submit", handleStudentSubmit);
  elements.resetStudentForm.addEventListener("click", resetStudentForm);
  elements.batchForm.addEventListener("submit", handleBatchSubmit);
  elements.assignStudentForm.addEventListener("submit", handleAssignStudentToBatch);
  elements.combineBatchForm.addEventListener("submit", handleCombineBatches);
  elements.attendanceForm.addEventListener("submit", handleAttendanceSubmit);
  elements.attendanceBatch.addEventListener("change", renderAttendanceStudents);
  elements.attendanceDashboardBatch.addEventListener("change", renderAttendanceDashboard);
  elements.attendanceDashboardDate.addEventListener("change", renderAttendanceDashboard);
  elements.paymentForm.addEventListener("submit", handlePaymentSubmit);
  elements.paymentStudent.addEventListener("change", handlePaymentStudentChange);
  elements.paymentBatch.addEventListener("change", handlePaymentBatchChange);
  elements.paymentCheckStudent.addEventListener("change", renderPaymentChecker);
  elements.paymentCheckBatch.addEventListener("change", renderPaymentChecker);
  elements.scheduleForm.addEventListener("submit", handleScheduleSubmit);
  elements.scheduleBatch.addEventListener("change", updateScheduleFromBatch);
  elements.scheduleDay.addEventListener("change", updateScheduleMessage);
  elements.scheduleVenue.addEventListener("change", updateScheduleMessage);
  elements.scheduleFromTime.addEventListener("input", updateScheduleMessage);
  elements.scheduleToTime.addEventListener("input", updateScheduleMessage);
  elements.studentSearch.addEventListener("input", renderBoards);
  elements.studentLevelFilter.addEventListener("change", renderBoards);
  elements.batchSearch.addEventListener("input", renderBoards);
  elements.paymentStudentFilter.addEventListener("change", renderBoards);
  elements.paymentBatchFilter.addEventListener("change", renderBoards);
  elements.viewButtons.forEach((button) => {
    button.addEventListener("click", () => {
      state.activeView = button.dataset.viewTarget;
      updateActiveView();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  });
  window.addEventListener("scroll", handleWindowScroll, { passive: true });
}

function handleLogin(event) {
  event.preventDefault();
  const isValid = elements.loginUsername.value.trim() === ADMIN_USERNAME
    && elements.loginPassword.value === ADMIN_PASSWORD;

  if (!isValid) {
    elements.loginError.hidden = false;
    return;
  }

  state.isAuthenticated = true;
  localStorage.setItem(AUTH_KEY, "true");
  elements.loginError.hidden = true;
  elements.loginForm.reset();
  updateAuthUi();
}

function handleLogout() {
  state.isAuthenticated = false;
  localStorage.removeItem(AUTH_KEY);
  updateAuthUi();
}

function updateAuthUi() {
  elements.loginScreen.hidden = state.isAuthenticated;
  elements.authStatus.textContent = state.isAuthenticated ? "Logged in as admin" : "Logged out";
}

function updateActiveView() {
  elements.views.forEach((view) => {
    view.classList.toggle("is-active", view.id === state.activeView);
  });
}

async function handleStudentSubmit(event) {
  event.preventDefault();
  const record = {
    id: elements.studentId.value || crypto.randomUUID(),
    surname: elements.studentSurname.value.trim(),
    lastName: elements.studentLastName.value.trim(),
    gender: elements.studentGender.value,
    dob: elements.studentDob.value,
    fatherName: elements.fatherName.value.trim(),
    fatherPhone: elements.fatherPhone.value.trim(),
    fatherOccupation: elements.fatherOccupation.value.trim(),
    motherName: elements.motherName.value.trim(),
    motherPhone: elements.motherPhone.value.trim(),
    motherOccupation: elements.motherOccupation.value.trim(),
    schoolName: elements.schoolName.value.trim(),
    schoolClass: elements.schoolClass.value.trim(),
    email: elements.emailId.value.trim(),
    level: Number(elements.studentLevel.value) || 1,
    batchId: elements.studentBatch.value
  };

  if (supabaseClient) {
    await upsertStudentCloud(record);
    await replaceStudentBatchCloud(record.id, record.batchId);
    await loadCloudData();
  } else {
    upsertStudentLocal(record);
    replaceStudentBatchLocal(record.id, record.batchId);
  }

  resetStudentForm();
  render();
  showToast("Student saved successfully");
}

function resetStudentForm() {
  elements.studentForm.reset();
  elements.studentId.value = "";
  elements.studentLevel.value = 1;
}

async function handleBatchSubmit(event) {
  event.preventDefault();
  const record = {
    id: elements.batchId.value || crypto.randomUUID(),
    name: elements.batchName.value.trim(),
    level: Number(elements.batchLevel.value) || 1,
    notes: elements.batchNotes.value.trim(),
    studentIds: Array.from(elements.batchStudents.selectedOptions, (option) => option.value)
  };

  if (supabaseClient) {
    if (elements.batchId.value) {
      await updateBatchCloud(record);
      showToast("Batch updated successfully");
    } else {
      await insertBatchCloud(record);
      showToast("Batch created successfully");
    }
    await loadCloudData();
  } else {
    upsertBatchLocal(record);
    showToast(elements.batchId.value ? "Batch updated successfully" : "Batch created successfully");
  }

  resetBatchForm();
  render();
}

async function handleAssignStudentToBatch(event) {
  event.preventDefault();
  const studentId = elements.assignStudent.value;
  const batchId = elements.assignBatch.value;
  if (!studentId || !batchId) {
    return;
  }

  const batchRecord = state.batches.find((entry) => entry.id === batchId);
  if (!batchRecord) {
    return;
  }

  const updatedRecord = {
    ...batchRecord,
    studentIds: [...new Set([...batchRecord.studentIds, studentId])]
  };

  if (supabaseClient) {
    await updateBatchCloud(updatedRecord);
    await loadCloudData();
  } else {
    upsertBatchLocal(updatedRecord);
  }

  elements.assignStudentForm.reset();
  render();
  showToast("Student added to batch");
}

async function handleCombineBatches(event) {
  event.preventDefault();
  const selectedBatchIds = Array.from(elements.combineBatchSelection.selectedOptions, (option) => option.value);
  if (selectedBatchIds.length < 2) {
    showToast("Select at least two batches to combine", true);
    return;
  }

  const selectedBatches = state.batches.filter((entry) => selectedBatchIds.includes(entry.id));
  const combinedRecord = {
    id: crypto.randomUUID(),
    name: elements.combinedBatchName.value.trim(),
    level: Number(elements.combinedBatchLevel.value) || 1,
    notes: `Combined from: ${selectedBatches.map((entry) => entry.name).join(", ")}`,
    studentIds: [...new Set(selectedBatches.flatMap((entry) => entry.studentIds))]
  };

  if (supabaseClient) {
    await insertBatchCloud(combinedRecord);
    await loadCloudData();
  } else {
    upsertBatchLocal(combinedRecord);
  }

  elements.combineBatchForm.reset();
  elements.combinedBatchLevel.value = 1;
  render();
  showToast("Combined batch created successfully");
}

async function handleAttendanceSubmit(event) {
  event.preventDefault();
  const batchId = elements.attendanceBatch.value;
  const batchRecord = state.batches.find((entry) => entry.id === batchId);
  if (!batchRecord) {
    return;
  }

  const payload = {
    id: findAttendanceSessionId(batchId, elements.attendanceDate.value) || crypto.randomUUID(),
    batchId,
    attendanceDate: elements.attendanceDate.value,
    records: batchRecord.studentIds.map((studentId) => {
      const checked = document.querySelector(`input[name="attendance-${studentId}"]:checked`);
      return {
        studentId,
        status: checked ? checked.value : "Absent"
      };
    })
  };

  if (supabaseClient) {
    await upsertAttendanceCloud(payload);
    await loadCloudData();
  } else {
    upsertAttendanceLocal(payload);
  }

  render();
  showToast("Attendance saved successfully");
}

async function handlePaymentSubmit(event) {
  event.preventDefault();
  const record = {
    id: elements.paymentId.value || crypto.randomUUID(),
    studentId: elements.paymentStudent.value,
    batchId: elements.paymentBatch.value,
    level: Number(elements.paymentLevel.value) || 1,
    amount: Number(elements.paymentAmount.value) || 0,
    dues: Number(elements.paymentDues.value) || 0,
    mode: elements.paymentMode.value,
    comments: elements.paymentComments.value.trim(),
    date: elements.paymentDate.value
  };

  if (supabaseClient) {
    if (elements.paymentId.value) {
      await updatePaymentCloud(record);
    } else {
      await insertPaymentCloud(record);
    }
    await loadCloudData();
  } else {
    upsertPaymentLocal(record);
  }

  resetPaymentForm();
  render();
  showToast("Payment saved successfully");
}

function handlePaymentStudentChange() {
  const student = state.students.find((entry) => entry.id === elements.paymentStudent.value);
  if (!student) {
    elements.paymentLevel.value = 1;
    return;
  }

  const currentBatch = state.batches.find((entry) => entry.studentIds.includes(student.id));
  if (currentBatch) {
    elements.paymentBatch.value = currentBatch.id;
    elements.paymentLevel.value = currentBatch.level;
  } else {
    elements.paymentLevel.value = student.level;
  }
}

function handlePaymentBatchChange() {
  const batch = state.batches.find((entry) => entry.id === elements.paymentBatch.value);
  if (batch) {
    elements.paymentLevel.value = batch.level;
  }
}

async function handleScheduleSubmit(event) {
  event.preventDefault();
  const record = {
    id: elements.scheduleId.value || crypto.randomUUID(),
    batchId: elements.scheduleBatch.value,
    level: Number(elements.scheduleLevel.value) || 1,
    day: elements.scheduleDay.value,
    venue: elements.scheduleVenue.value,
    fromTime: elements.scheduleFromTime.value,
    toTime: elements.scheduleToTime.value,
    message: elements.scheduleMessage.value.trim()
  };

  if (supabaseClient) {
    if (elements.scheduleId.value) {
      await updateScheduleCloud(record);
      showToast("Schedule updated successfully");
    } else {
      await insertScheduleCloud(record);
      showToast("Schedule created successfully");
    }
    await loadCloudData();
  } else {
    upsertScheduleLocal(record);
    showToast(elements.scheduleId.value ? "Schedule updated successfully" : "Schedule created successfully");
  }

  resetScheduleForm();
  render();
}

function updateScheduleFromBatch() {
  const batch = state.batches.find((entry) => entry.id === elements.scheduleBatch.value);
  elements.scheduleLevel.value = batch ? batch.level : "";
  updateScheduleMessage();
}

function updateScheduleMessage() {
  const batch = state.batches.find((entry) => entry.id === elements.scheduleBatch.value);
  const venue = elements.scheduleVenue.value;
  const fromTime = elements.scheduleFromTime.value;
  const toTime = elements.scheduleToTime.value;
  elements.scheduleMessage.value = batch && venue && fromTime && toTime
    ? `Attend UCMAS ABACUS ${batch.name} CLASS at ${fromTime} to ${toTime} at ${venue}.`
    : "";
}

function loadLocalState() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    return structuredClone(sampleData);
  }

  try {
    return JSON.parse(stored);
  } catch (error) {
    console.error("Unable to parse stored state", error);
    return structuredClone(sampleData);
  }
}

function hydrateState(data) {
  state.students = data.students || [];
  state.batches = data.batches || [];
  state.attendance = data.attendance || [];
  state.payments = data.payments || [];
  state.schedules = data.schedules || [];
}

function persistLocalState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    students: state.students,
    batches: state.batches,
    attendance: state.attendance,
    payments: state.payments,
    schedules: state.schedules
  }));
}

function isStateEmpty() {
  return state.students.length === 0
    && state.batches.length === 0
    && state.attendance.length === 0
    && state.payments.length === 0
    && state.schedules.length === 0;
}

function upsertStudentLocal(record) {
  const existingIndex = state.students.findIndex((entry) => entry.id === record.id);
  const studentRecord = { ...record };
  delete studentRecord.batchId;
  if (existingIndex >= 0) {
    state.students[existingIndex] = studentRecord;
  } else {
    state.students.unshift(studentRecord);
  }
  persistLocalState();
}

function replaceStudentBatchLocal(studentId, batchId) {
  state.batches = state.batches.map((entry) => ({
    ...entry,
    studentIds: entry.studentIds.filter((id) => id !== studentId)
  })).map((entry) => {
    if (entry.id !== batchId) {
      return entry;
    }
    return {
      ...entry,
      studentIds: [...new Set([...entry.studentIds, studentId])]
    };
  });
  persistLocalState();
}

function upsertBatchLocal(record) {
  const existingIndex = state.batches.findIndex((entry) => entry.id === record.id);
  if (existingIndex >= 0) {
    state.batches[existingIndex] = record;
  } else {
    state.batches.unshift(record);
  }
  persistLocalState();
}

function findAttendanceSessionId(batchId, attendanceDate) {
  return state.attendance.find((entry) => entry.batchId === batchId && entry.attendanceDate === attendanceDate)?.id || "";
}

function upsertAttendanceLocal(record) {
  const existingIndex = state.attendance.findIndex((entry) => entry.id === record.id);
  if (existingIndex >= 0) {
    state.attendance[existingIndex] = record;
  } else {
    state.attendance.unshift(record);
  }
  persistLocalState();
}

function upsertPaymentLocal(record) {
  const existingIndex = state.payments.findIndex((entry) => entry.id === record.id);
  if (existingIndex >= 0) {
    state.payments[existingIndex] = record;
  } else {
    state.payments.unshift(record);
  }
  persistLocalState();
}

function upsertScheduleLocal(record) {
  const existingIndex = state.schedules.findIndex((entry) => entry.id === record.id);
  if (existingIndex >= 0) {
    state.schedules[existingIndex] = record;
  } else {
    state.schedules.unshift(record);
  }
  persistLocalState();
}

async function loadCloudData() {
  const [
    studentsResult,
    batchesResult,
    linksResult,
    sessionsResult,
    recordsResult,
    paymentsResult,
    schedulesResult
  ] = await Promise.all([
    supabaseClient.from("students").select("*").order("created_at", { ascending: false }),
    supabaseClient.from("classes").select("*").order("created_at", { ascending: false }),
    supabaseClient.from("class_students").select("*"),
    supabaseClient.from("attendance_sessions").select("*").order("attendance_date", { ascending: false }),
    supabaseClient.from("attendance_records").select("*"),
    supabaseClient.from("fees").select("*").order("payment_date", { ascending: false }),
    supabaseClient.from("schedules").select("*").order("created_at", { ascending: false })
  ]);

  const error = [
    studentsResult.error,
    batchesResult.error,
    linksResult.error,
    sessionsResult.error,
    recordsResult.error,
    paymentsResult.error,
    schedulesResult.error
  ].find(Boolean);

  if (error) {
    throw error;
  }

  const groupedLinks = groupBy(linksResult.data, "class_id");
  const groupedAttendance = groupBy(recordsResult.data, "session_id");

  hydrateState({
    students: studentsResult.data.map(mapStudentFromDb),
    batches: batchesResult.data.map((entry) => ({
      id: entry.id,
      name: entry.name,
      level: Number(entry.level) || 1,
      notes: entry.notes || "",
      studentIds: (groupedLinks[entry.id] || []).map((item) => item.student_id)
    })),
    attendance: sessionsResult.data.map((entry) => ({
      id: entry.id,
      batchId: entry.class_id,
      attendanceDate: entry.attendance_date,
      records: (groupedAttendance[entry.id] || []).map((item) => ({
        studentId: item.student_id,
        status: item.status
      }))
    })),
    payments: paymentsResult.data.map((entry) => ({
      id: entry.id,
      studentId: entry.student_id,
      batchId: entry.batch_id,
      level: Number(entry.level) || 1,
      amount: Number(entry.amount),
      dues: Number(entry.dues || 0),
      mode: entry.payment_mode || "",
      comments: entry.comments || "",
      date: entry.payment_date
    })),
    schedules: schedulesResult.data.map((entry) => ({
      id: entry.id,
      batchId: entry.class_id,
      level: Number(entry.level) || 1,
      day: entry.day,
      venue: entry.venue || "",
      fromTime: entry.from_time,
      toTime: entry.to_time,
      message: entry.message
    }))
  });
}

async function seedCloudData() {
  const sample = createSampleData();

  const { error: studentError } = await supabaseClient.from("students").insert(
    sample.students.map(mapStudentToDb)
  );
  if (studentError) {
    throw studentError;
  }

  const { error: batchError } = await supabaseClient.from("classes").insert(
    sample.batches.map((entry) => ({
      id: entry.id,
      name: entry.name,
      level: entry.level,
      notes: entry.notes
    }))
  );
  if (batchError) {
    throw batchError;
  }

  const { error: linkError } = await supabaseClient.from("class_students").insert(
    sample.batches.flatMap((entry) => entry.studentIds.map((studentId) => ({
      class_id: entry.id,
      student_id: studentId
    })))
  );
  if (linkError) {
    throw linkError;
  }

  const { error: paymentError } = await supabaseClient.from("fees").insert(
    sample.payments.map((entry) => ({
      id: entry.id,
      student_id: entry.studentId,
      batch_id: entry.batchId,
      level: entry.level,
      amount: entry.amount,
      dues: entry.dues,
      payment_mode: entry.mode,
      comments: entry.comments,
      payment_date: entry.date
    }))
  );
  if (paymentError) {
    throw paymentError;
  }

  const { error: scheduleError } = await supabaseClient.from("schedules").insert(
    sample.schedules.map((entry) => ({
      id: entry.id,
      class_id: entry.batchId,
      level: entry.level,
      day: entry.day,
      venue: entry.venue,
      from_time: entry.fromTime,
      to_time: entry.toTime,
      message: entry.message
    }))
  );
  if (scheduleError) {
    throw scheduleError;
  }
}

async function upsertStudentCloud(record) {
  const { error } = await supabaseClient.from("students").upsert(mapStudentToDb(record));
  if (error) {
    throw error;
  }
}

async function replaceStudentBatchCloud(studentId, batchId) {
  const { error: deleteError } = await supabaseClient.from("class_students").delete().eq("student_id", studentId);
  if (deleteError) {
    throw deleteError;
  }

  if (!batchId) {
    return;
  }

  const { error: insertError } = await supabaseClient.from("class_students").insert({
    class_id: batchId,
    student_id: studentId
  });
  if (insertError) {
    throw insertError;
  }
}

async function insertBatchCloud(record) {
  const { error: batchError } = await supabaseClient.from("classes").insert({
    id: record.id,
    name: record.name,
    level: record.level,
    notes: record.notes
  });
  if (batchError) {
    throw batchError;
  }
  await replaceBatchStudentsCloud(record);
}

async function updateBatchCloud(record) {
  const { error: batchError } = await supabaseClient.from("classes").update({
    name: record.name,
    level: record.level,
    notes: record.notes
  }).eq("id", record.id);
  if (batchError) {
    throw batchError;
  }
  await replaceBatchStudentsCloud(record);
}

async function replaceBatchStudentsCloud(record) {
  const { error: deleteError } = await supabaseClient.from("class_students").delete().eq("class_id", record.id);
  if (deleteError) {
    throw deleteError;
  }

  if (record.studentIds.length === 0) {
    return;
  }

  const { error: insertError } = await supabaseClient.from("class_students").insert(
    record.studentIds.map((studentId) => ({
      class_id: record.id,
      student_id: studentId
    }))
  );
  if (insertError) {
    throw insertError;
  }
}

async function deleteBatchCloud(batchId) {
  const { error } = await supabaseClient.from("classes").delete().eq("id", batchId);
  if (error) {
    throw error;
  }
}

async function upsertAttendanceCloud(record) {
  const existingId = findAttendanceSessionId(record.batchId, record.attendanceDate);
  if (existingId) {
    const { error: deleteError } = await supabaseClient.from("attendance_records").delete().eq("session_id", existingId);
    if (deleteError) {
      throw deleteError;
    }
  } else {
    const { error: sessionError } = await supabaseClient.from("attendance_sessions").insert({
      id: record.id,
      class_id: record.batchId,
      attendance_date: record.attendanceDate
    });
    if (sessionError) {
      throw sessionError;
    }
  }

  const sessionId = existingId || record.id;
  const { error: insertError } = await supabaseClient.from("attendance_records").insert(
    record.records.map((entry) => ({
      session_id: sessionId,
      student_id: entry.studentId,
      status: entry.status
    }))
  );
  if (insertError) {
    throw insertError;
  }
}

async function insertPaymentCloud(record) {
  const { error } = await supabaseClient.from("fees").insert({
    id: record.id,
    student_id: record.studentId,
    batch_id: record.batchId,
    level: record.level,
    amount: record.amount,
    dues: record.dues,
    payment_mode: record.mode,
    comments: record.comments,
    payment_date: record.date
  });
  if (error) {
    throw error;
  }
}

async function updatePaymentCloud(record) {
  const { error } = await supabaseClient.from("fees").update({
    student_id: record.studentId,
    batch_id: record.batchId,
    level: record.level,
    amount: record.amount,
    dues: record.dues,
    payment_mode: record.mode,
    comments: record.comments,
    payment_date: record.date
  }).eq("id", record.id);
  if (error) {
    throw error;
  }
}

async function deletePaymentCloud(paymentId) {
  const { error } = await supabaseClient.from("fees").delete().eq("id", paymentId);
  if (error) {
    throw error;
  }
}

async function insertScheduleCloud(record) {
  const { error } = await supabaseClient.from("schedules").insert({
    id: record.id,
    class_id: record.batchId,
    level: record.level,
    day: record.day,
    venue: record.venue,
    from_time: record.fromTime,
    to_time: record.toTime,
    message: record.message
  });
  if (error) {
    throw error;
  }
}

async function updateScheduleCloud(record) {
  const { error } = await supabaseClient.from("schedules").update({
    class_id: record.batchId,
    level: record.level,
    day: record.day,
    venue: record.venue,
    from_time: record.fromTime,
    to_time: record.toTime,
    message: record.message
  }).eq("id", record.id);
  if (error) {
    throw error;
  }
}

async function deleteScheduleCloud(scheduleId) {
  const { error } = await supabaseClient.from("schedules").delete().eq("id", scheduleId);
  if (error) {
    throw error;
  }
}

function render() {
  renderStats();
  renderHomeSchedule();
  renderSelectOptionsAll();
  renderAttendanceStudents();
  renderAttendanceDashboard();
  renderPaymentChecker();
  renderScheduleManager();
  renderBoards();
  updateActionLabels();
}

function renderStats() {
  elements.studentCount.textContent = state.students.length;
  elements.batchCount.textContent = state.batches.length;
  elements.todayCount.textContent = state.schedules.length;
}

function renderHomeSchedule() {
  if (state.schedules.length === 0) {
    elements.homeScheduleList.innerHTML = `<div class="empty-state">No upcoming classes scheduled yet.</div>`;
    return;
  }

  elements.homeScheduleList.innerHTML = state.schedules.slice(0, 6).map((schedule) => {
    const batch = state.batches.find((entry) => entry.id === schedule.batchId);
    return `
      <article class="activity-card">
        <h4>${escapeHtml(batch?.name || "Unknown batch")}</h4>
        <p><strong>${escapeHtml(schedule.day)}</strong> · ${escapeHtml(schedule.fromTime)} to ${escapeHtml(schedule.toTime)}</p>
        <p>${escapeHtml(schedule.venue)}</p>
      </article>
    `;
  }).join("");
}

function renderSelectOptionsAll() {
  const levelOptions = [...new Set(state.students.map((student) => String(student.level)))].sort();
  const prevLevelFilter = elements.studentLevelFilter.value;
  elements.studentLevelFilter.innerHTML = `<option value="">All levels</option>${levelOptions.map((level) => `<option value="${level}">${level}</option>`).join("")}`;
  elements.studentLevelFilter.value = levelOptions.includes(prevLevelFilter) ? prevLevelFilter : "";

  fillSelect(elements.studentBatch, state.batches, "Select batch");
  fillSelect(elements.assignStudent, state.students, "Select student", formatStudentName);
  fillSelect(elements.assignBatch, state.batches, "Select batch");
  fillSelect(elements.attendanceBatch, state.batches, "Select batch");
  fillSelect(elements.attendanceDashboardBatch, state.batches, "Select batch");
  fillSelect(elements.paymentStudent, state.students, "Select student", formatStudentName);
  fillSelect(elements.paymentBatch, state.batches, "Select batch");
  fillSelect(elements.paymentCheckStudent, state.students, "All students", formatStudentName, true);
  fillSelect(elements.paymentCheckBatch, state.batches, "All batches", (entry) => entry.name, true);
  fillSelect(elements.scheduleBatch, state.batches, "Select batch");
  fillSelect(elements.paymentStudentFilter, state.students, "All students", formatStudentName, true);
  fillSelect(elements.paymentBatchFilter, state.batches, "All batches", (entry) => entry.name, true);
  fillSelect(elements.batchStudents, state.students, "", formatStudentName, false, true);
  fillSelect(elements.combineBatchSelection, state.batches, "", (entry) => entry.name, false, true);

  const previousBatchSearch = elements.batchSearch.value;
  elements.batchSearch.value = previousBatchSearch;
}

function fillSelect(select, items, placeholder, labelFn = (entry) => entry.name, allowEmpty = false, isMulti = false) {
  const previousValue = isMulti
    ? Array.from(select.selectedOptions, (option) => option.value)
    : select.value;

  select.innerHTML = "";

  if (!isMulti) {
    const option = document.createElement("option");
    option.value = "";
    option.textContent = placeholder;
    if (allowEmpty || placeholder) {
      select.append(option);
    }
  }

  items.forEach((entry) => {
    const option = document.createElement("option");
    option.value = entry.id;
    option.textContent = labelFn(entry);
    select.append(option);
  });

  if (isMulti) {
    Array.from(select.options).forEach((option) => {
      option.selected = previousValue.includes(option.value);
    });
  } else if (items.some((entry) => entry.id === previousValue)) {
    select.value = previousValue;
  }
}

function renderAttendanceStudents() {
  const batch = state.batches.find((entry) => entry.id === elements.attendanceBatch.value);
  elements.attendanceStudents.innerHTML = "";

  if (!batch) {
    elements.attendanceStudents.innerHTML = `<div class="empty-state">Select a batch to mark attendance.</div>`;
    return;
  }

  if (batch.studentIds.length === 0) {
    elements.attendanceStudents.innerHTML = `<div class="empty-state">No students are mapped to this batch.</div>`;
    return;
  }

  batch.studentIds
    .map((studentId) => state.students.find((entry) => entry.id === studentId))
    .filter(Boolean)
    .forEach((student) => {
      const fragment = elements.attendanceTemplate.content.cloneNode(true);
      fragment.querySelector(".attendance-name").textContent = formatStudentName(student);
      const radios = fragment.querySelectorAll('input[type="radio"]');
      radios.forEach((radio) => {
        radio.name = `attendance-${student.id}`;
      });
      radios[0].checked = true;
      elements.attendanceStudents.append(fragment);
    });
}

function renderAttendanceDashboard() {
  const batchId = elements.attendanceDashboardBatch.value;
  const attendanceDate = elements.attendanceDashboardDate.value;
  const batch = state.batches.find((entry) => entry.id === batchId);

  if (!batchId || !attendanceDate || !batch) {
    elements.attendanceReviewList.innerHTML = `<div class="empty-state">Select a batch and date to review attendance.</div>`;
    elements.attendanceLegend.innerHTML = "";
    drawAttendanceChart(0, 0);
    return;
  }

  const session = state.attendance.find((entry) => entry.batchId === batchId && entry.attendanceDate === attendanceDate);
  if (!session) {
    elements.attendanceReviewList.innerHTML = `<div class="empty-state">No attendance was recorded for this batch on that date.</div>`;
    elements.attendanceLegend.innerHTML = `
      <div class="legend-item"><span class="legend-color" style="background:#2f7d5d"></span>Present: 0</div>
      <div class="legend-item"><span class="legend-color" style="background:#c4632f"></span>Absent: 0</div>
      <div class="legend-item"><span class="legend-color" style="background:#264653"></span>Total Students: ${batch.studentIds.length}</div>
    `;
    drawAttendanceChart(0, 0);
    return;
  }

  const presentCount = session.records.filter((entry) => entry.status === "Present").length;
  const absentCount = session.records.filter((entry) => entry.status === "Absent").length;
  elements.attendanceLegend.innerHTML = `
    <div class="legend-item"><span class="legend-color" style="background:#2f7d5d"></span>Present: ${presentCount}</div>
    <div class="legend-item"><span class="legend-color" style="background:#c4632f"></span>Absent: ${absentCount}</div>
    <div class="legend-item"><span class="legend-color" style="background:#264653"></span>Total Students: ${batch.studentIds.length}</div>
  `;

  drawAttendanceChart(presentCount, absentCount);

  elements.attendanceReviewList.innerHTML = session.records.map((entry) => {
    const student = state.students.find((record) => record.id === entry.studentId);
    return `
      <article class="activity-card">
        <h4>${escapeHtml(formatStudentName(student))}</h4>
        <p class="${entry.status === "Present" ? "tone-good" : "tone-danger"}"><strong>Status:</strong> ${escapeHtml(entry.status)}</p>
      </article>
    `;
  }).join("");
}

function drawAttendanceChart(presentCount, absentCount) {
  const canvas = elements.attendanceChart;
  const context = canvas.getContext("2d");
  const total = presentCount + absentCount;
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  const radius = 84;

  context.clearRect(0, 0, canvas.width, canvas.height);
  context.lineWidth = 34;

  if (total === 0) {
    context.beginPath();
    context.strokeStyle = "#ead8c0";
    context.arc(centerX, centerY, radius, 0, Math.PI * 2);
    context.stroke();
    context.fillStyle = "#7d6651";
    context.font = "16px Trebuchet MS";
    context.textAlign = "center";
    context.fillText("No Data", centerX, centerY + 6);
    return;
  }

  const presentAngle = (presentCount / total) * Math.PI * 2;
  let startAngle = -Math.PI / 2;

  context.beginPath();
  context.strokeStyle = "#2f7d5d";
  context.arc(centerX, centerY, radius, startAngle, startAngle + presentAngle);
  context.stroke();

  startAngle += presentAngle;
  context.beginPath();
  context.strokeStyle = "#c4632f";
  context.arc(centerX, centerY, radius, startAngle, startAngle + ((absentCount / total) * Math.PI * 2));
  context.stroke();

  context.fillStyle = "#34261a";
  context.font = "700 18px Trebuchet MS";
  context.textAlign = "center";
  context.fillText(String(total), centerX, centerY - 4);
  context.font = "13px Trebuchet MS";
  context.fillText("Students", centerX, centerY + 18);

  labelPieValue(context, centerX, centerY, radius, -Math.PI / 2 + (presentAngle / 2), presentCount, "#2f7d5d");
  labelPieValue(context, centerX, centerY, radius, startAngle + (((absentCount / total) * Math.PI * 2) / 2), absentCount, "#c4632f");
}

function labelPieValue(context, centerX, centerY, radius, angle, value, color) {
  if (!value) {
    return;
  }

  const x = centerX + Math.cos(angle) * (radius + 28);
  const y = centerY + Math.sin(angle) * (radius + 28);
  context.fillStyle = color;
  context.font = "700 14px Trebuchet MS";
  context.fillText(String(value), x, y);
}

function renderPaymentChecker() {
  const studentId = elements.paymentCheckStudent.value;
  const batchId = elements.paymentCheckBatch.value;

  const filteredPayments = state.payments.filter((entry) => {
    const studentMatch = !studentId || entry.studentId === studentId;
    const batchMatch = !batchId || entry.batchId === batchId;
    return studentMatch && batchMatch;
  });

  const totalPaid = filteredPayments.reduce((sum, entry) => sum + Number(entry.amount || 0), 0);
  const totalDues = filteredPayments.reduce((sum, entry) => sum + Number(entry.dues || 0), 0);

  const batchStudentIds = batchId
    ? new Set((state.batches.find((entry) => entry.id === batchId)?.studentIds) || [])
    : new Set();
  const paidStudentIds = new Set(filteredPayments.map((entry) => entry.studentId));
  const batchPendingCount = batchId ? [...batchStudentIds].filter((id) => !paidStudentIds.has(id)).length : 0;

  elements.paymentSummary.innerHTML = `
    <h4>Payment Summary</h4>
    <div class="summary-metrics">
      <div class="metric-card"><strong>Total Paid</strong><p>Rs. ${totalPaid.toFixed(2)}</p></div>
      <div class="metric-card"><strong>Total Dues</strong><p>Rs. ${totalDues.toFixed(2)}</p></div>
      <div class="metric-card"><strong>Records</strong><p>${filteredPayments.length}</p></div>
      <div class="metric-card"><strong>Pending in Batch</strong><p>${batchPendingCount}</p></div>
    </div>
  `;

  if (filteredPayments.length === 0) {
    elements.paymentHistoryList.innerHTML = `<div class="empty-state">No payments match the selected student or batch.</div>`;
    return;
  }

  elements.paymentHistoryList.innerHTML = filteredPayments.map((entry) => {
    const student = state.students.find((record) => record.id === entry.studentId);
    const batch = state.batches.find((record) => record.id === entry.batchId);
    return `
      <article class="activity-card">
        <h4>${escapeHtml(formatStudentName(student))}</h4>
        <p><strong>Batch:</strong> ${escapeHtml(batch?.name || "Unknown batch")}</p>
        <p><strong>Level:</strong> ${entry.level}</p>
        <p><strong>Paid:</strong> Rs. ${Number(entry.amount).toFixed(2)}</p>
        <p><strong>Dues:</strong> Rs. ${Number(entry.dues).toFixed(2)}</p>
        <p><strong>Mode:</strong> ${escapeHtml(entry.mode)}</p>
        <p><strong>Date:</strong> ${formatDate(entry.date)}</p>
        <p>${escapeHtml(entry.comments || "No comments")}</p>
        <div class="inline-actions">
          <button class="card-button" type="button" data-action="edit-payment" data-id="${entry.id}">Edit</button>
          ${entry.dues > 0 ? `<button class="card-button" type="button" data-action="clear-dues" data-id="${entry.id}">Clear Dues</button>` : ""}
          <button class="danger-button" type="button" data-action="delete-payment" data-id="${entry.id}">Delete</button>
        </div>
      </article>
    `;
  }).join("");

  document.querySelectorAll('[data-action="edit-payment"]').forEach((button) => {
    button.addEventListener("click", () => editPayment(button.dataset.id));
  });
  document.querySelectorAll('[data-action="clear-dues"]').forEach((button) => {
    button.addEventListener("click", () => clearPaymentDues(button.dataset.id));
  });
  document.querySelectorAll('[data-action="delete-payment"]').forEach((button) => {
    button.addEventListener("click", () => deletePayment(button.dataset.id));
  });
}

function renderScheduleManager() {
  if (state.schedules.length === 0) {
    elements.scheduleManagerList.innerHTML = `<div class="empty-state">No schedules created yet.</div>`;
    return;
  }

  elements.scheduleManagerList.innerHTML = state.schedules.map((entry) => {
    const batch = state.batches.find((record) => record.id === entry.batchId);
    return `
      <article class="activity-card">
        <h4>${escapeHtml(batch?.name || "Unknown batch")}</h4>
        <p><strong>Day:</strong> ${escapeHtml(entry.day)}</p>
        <p><strong>Time:</strong> ${escapeHtml(entry.fromTime)} to ${escapeHtml(entry.toTime)}</p>
        <p><strong>Venue:</strong> ${escapeHtml(entry.venue)}</p>
        <p>${escapeHtml(entry.message)}</p>
        <div class="inline-actions">
          <button class="card-button" type="button" data-action="edit-schedule" data-id="${entry.id}">Edit</button>
          <button class="danger-button" type="button" data-action="delete-schedule" data-id="${entry.id}">Delete</button>
        </div>
      </article>
    `;
  }).join("");

  document.querySelectorAll('[data-action="edit-schedule"]').forEach((button) => {
    button.addEventListener("click", () => editSchedule(button.dataset.id));
  });
  document.querySelectorAll('[data-action="delete-schedule"]').forEach((button) => {
    button.addEventListener("click", () => deleteSchedule(button.dataset.id));
  });
}

function renderBoards() {
  const context = getBoardContext();
  renderStudentBoard(context.students);
  renderBatchBoard(context.batches);
  renderPaymentBoard(context.payments);
  renderScheduleBoard(context.schedules);
}

function getBoardContext() {
  const studentQuery = elements.studentSearch.value.trim().toLowerCase();
  const studentLevel = elements.studentLevelFilter.value;
  const batchQuery = elements.batchSearch.value.trim().toLowerCase();
  const paymentStudentId = elements.paymentStudentFilter.value;
  const paymentBatchId = elements.paymentBatchFilter.value;

  const matchedBatches = state.batches.filter((entry) => {
    const queryMatch = !batchQuery || [entry.name, entry.notes, String(entry.level)].some((value) =>
      String(value || "").toLowerCase().includes(batchQuery)
    );
    const paymentBatchMatch = !paymentBatchId || entry.id === paymentBatchId;
    const paymentStudentMatch = !paymentStudentId || entry.studentIds.includes(paymentStudentId);
    return queryMatch && paymentBatchMatch && paymentStudentMatch;
  });

  const matchedBatchIds = new Set(matchedBatches.map((entry) => entry.id));
  const studentsInMatchedBatches = new Set(matchedBatches.flatMap((entry) => entry.studentIds));

  const students = state.students.filter((entry) => {
    const queryMatch = !studentQuery || [
      entry.surname,
      entry.lastName,
      entry.schoolName,
      entry.fatherPhone,
      entry.motherPhone,
      String(entry.level)
    ].some((value) => String(value || "").toLowerCase().includes(studentQuery));
    const levelMatch = !studentLevel || String(entry.level) === studentLevel;
    const paymentStudentMatch = !paymentStudentId || entry.id === paymentStudentId;
    const batchContextMatch = matchedBatches.length === 0 && !batchQuery && !paymentBatchId
      ? true
      : studentsInMatchedBatches.has(entry.id);
    return queryMatch && levelMatch && paymentStudentMatch && batchContextMatch;
  });

  const allowedStudentIds = new Set(students.map((entry) => entry.id));

  const batches = state.batches.filter((entry) => {
    const matchedBySearch = !batchQuery || matchedBatchIds.has(entry.id);
    const paymentBatchMatch = !paymentBatchId || entry.id === paymentBatchId;
    const paymentStudentMatch = !paymentStudentId || entry.studentIds.includes(paymentStudentId);
    const studentContextMatch = allowedStudentIds.size === 0
      ? !studentQuery && !studentLevel && !paymentStudentId
      : entry.studentIds.some((id) => allowedStudentIds.has(id));
    return matchedBySearch && paymentBatchMatch && paymentStudentMatch && studentContextMatch;
  });

  const allowedBatchIds = new Set(batches.map((entry) => entry.id));

  const payments = state.payments.filter((entry) => {
    const studentMatch = !paymentStudentId || entry.studentId === paymentStudentId;
    const batchMatch = !paymentBatchId || entry.batchId === paymentBatchId;
    const inAllowedStudents = allowedStudentIds.size === 0 ? true : allowedStudentIds.has(entry.studentId);
    const inAllowedBatches = allowedBatchIds.size === 0 ? true : allowedBatchIds.has(entry.batchId);
    return studentMatch && batchMatch && inAllowedStudents && inAllowedBatches;
  });

  const schedules = state.schedules.filter((entry) => allowedBatchIds.size === 0 ? true : allowedBatchIds.has(entry.batchId));

  return { students, batches, payments, schedules };
}

function renderStudentBoard(students) {
  if (students.length === 0) {
    elements.studentList.innerHTML = `<div class="empty-state">No students match the current filters.</div>`;
    return;
  }

  elements.studentList.innerHTML = students.map((entry) => {
    const batch = state.batches.find((record) => record.studentIds.includes(entry.id));
    return `
      <article class="data-card">
        <h4>${escapeHtml(formatStudentName(entry))}</h4>
        <p><strong>Gender:</strong> ${escapeHtml(entry.gender)}</p>
        <p><strong>School:</strong> ${escapeHtml(entry.schoolName)}</p>
        <p><strong>Class in School:</strong> ${escapeHtml(entry.schoolClass)}</p>
        <p><strong>Level:</strong> ${entry.level}</p>
        <p><strong>Batch:</strong> ${escapeHtml(batch?.name || "Not mapped")}</p>
        <div class="chip-row">
          <span class="chip">Father: ${escapeHtml(entry.fatherName)}</span>
          <span class="chip">Mother: ${escapeHtml(entry.motherName)}</span>
        </div>
        <div class="inline-actions">
          <button class="card-button" type="button" data-action="edit-student" data-id="${entry.id}">Edit</button>
        </div>
      </article>
    `;
  }).join("");

  document.querySelectorAll('[data-action="edit-student"]').forEach((button) => {
    button.addEventListener("click", () => editStudent(button.dataset.id));
  });
}

function renderBatchBoard(batches) {
  if (batches.length === 0) {
    elements.batchList.innerHTML = `<div class="empty-state">No batches match the current filters.</div>`;
    return;
  }

  elements.batchList.innerHTML = batches.map((entry) => `
    <article class="data-card">
      <h4>${escapeHtml(entry.name)}</h4>
      <p><strong>Level:</strong> ${entry.level}</p>
      <p><strong>Students:</strong> ${entry.studentIds.length}</p>
      <p>${escapeHtml(entry.notes || "No notes")}</p>
      <div class="inline-actions">
        <button class="card-button" type="button" data-action="edit-batch" data-id="${entry.id}">Edit</button>
        <button class="danger-button" type="button" data-action="delete-batch" data-id="${entry.id}">Delete</button>
      </div>
    </article>
  `).join("");

  document.querySelectorAll('[data-action="edit-batch"]').forEach((button) => {
    button.addEventListener("click", () => editBatch(button.dataset.id));
  });
  document.querySelectorAll('[data-action="delete-batch"]').forEach((button) => {
    button.addEventListener("click", () => deleteBatch(button.dataset.id));
  });
}

function renderPaymentBoard(payments) {
  if (payments.length === 0) {
    elements.paymentList.innerHTML = `<div class="empty-state">No payments match the current filters.</div>`;
    return;
  }

  elements.paymentList.innerHTML = payments.map((entry) => {
    const student = state.students.find((record) => record.id === entry.studentId);
    const batch = state.batches.find((record) => record.id === entry.batchId);
    return `
      <article class="activity-card">
        <h4>${escapeHtml(formatStudentName(student))}</h4>
        <p><strong>Batch:</strong> ${escapeHtml(batch?.name || "Unknown batch")}</p>
        <p><strong>Level:</strong> ${entry.level}</p>
        <p><strong>Paid:</strong> Rs. ${Number(entry.amount).toFixed(2)}</p>
        <p><strong>Dues:</strong> Rs. ${Number(entry.dues).toFixed(2)}</p>
        <p><strong>Mode:</strong> ${escapeHtml(entry.mode)}</p>
      </article>
    `;
  }).join("");
}

function renderScheduleBoard(schedules) {
  if (schedules.length === 0) {
    elements.scheduleList.innerHTML = `<div class="empty-state">No schedules match the current filters.</div>`;
    return;
  }

  elements.scheduleList.innerHTML = schedules.map((entry) => {
    const batch = state.batches.find((record) => record.id === entry.batchId);
    return `
      <article class="activity-card">
        <h4>${escapeHtml(batch?.name || "Unknown batch")}</h4>
        <p><strong>${escapeHtml(entry.day)}</strong> · ${escapeHtml(entry.fromTime)} to ${escapeHtml(entry.toTime)}</p>
        <p><strong>Venue:</strong> ${escapeHtml(entry.venue)}</p>
        <p>${escapeHtml(entry.message)}</p>
      </article>
    `;
  }).join("");
}

function editStudent(studentId) {
  const student = state.students.find((entry) => entry.id === studentId);
  if (!student) {
    return;
  }

  const mappedBatch = state.batches.find((entry) => entry.studentIds.includes(student.id));
  elements.studentId.value = student.id;
  elements.studentSurname.value = student.surname;
  elements.studentLastName.value = student.lastName;
  elements.studentGender.value = student.gender;
  elements.studentDob.value = student.dob;
  elements.fatherName.value = student.fatherName;
  elements.fatherPhone.value = student.fatherPhone;
  elements.fatherOccupation.value = student.fatherOccupation;
  elements.motherName.value = student.motherName;
  elements.motherPhone.value = student.motherPhone;
  elements.motherOccupation.value = student.motherOccupation;
  elements.schoolName.value = student.schoolName;
  elements.schoolClass.value = student.schoolClass;
  elements.emailId.value = student.email;
  elements.studentLevel.value = student.level;
  elements.studentBatch.value = mappedBatch?.id || "";
  state.activeView = "studentsView";
  updateActiveView();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function editBatch(batchId) {
  const batch = state.batches.find((entry) => entry.id === batchId);
  if (!batch) {
    return;
  }

  elements.batchId.value = batch.id;
  elements.batchName.value = batch.name;
  elements.batchLevel.value = batch.level;
  elements.batchNotes.value = batch.notes;
  Array.from(elements.batchStudents.options).forEach((option) => {
    option.selected = batch.studentIds.includes(option.value);
  });
  updateActionLabels();
  state.activeView = "batchView";
  updateActiveView();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

async function deleteBatch(batchId) {
  const batch = state.batches.find((entry) => entry.id === batchId);
  if (!batch || !window.confirm(`Delete batch "${batch.name}"?`)) {
    return;
  }

  if (supabaseClient) {
    await deleteBatchCloud(batchId);
    await loadCloudData();
  } else {
    state.batches = state.batches.filter((entry) => entry.id !== batchId);
    state.schedules = state.schedules.filter((entry) => entry.batchId !== batchId);
    state.attendance = state.attendance.filter((entry) => entry.batchId !== batchId);
    state.payments = state.payments.filter((entry) => entry.batchId !== batchId);
    persistLocalState();
  }

  resetBatchForm();
  render();
  showToast("Batch deleted successfully");
}

function editPayment(paymentId) {
  const payment = state.payments.find((entry) => entry.id === paymentId);
  if (!payment) {
    return;
  }

  elements.paymentId.value = payment.id;
  elements.paymentStudent.value = payment.studentId;
  elements.paymentBatch.value = payment.batchId;
  elements.paymentLevel.value = payment.level;
  elements.paymentAmount.value = payment.amount;
  elements.paymentDues.value = payment.dues;
  elements.paymentMode.value = payment.mode;
  elements.paymentComments.value = payment.comments;
  elements.paymentDate.value = payment.date;
  updateActionLabels();
  state.activeView = "paymentsView";
  updateActiveView();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

async function clearPaymentDues(paymentId) {
  const payment = state.payments.find((entry) => entry.id === paymentId);
  if (!payment) {
    return;
  }

  const updated = {
    ...payment,
    amount: Number(payment.amount) + Number(payment.dues),
    dues: 0,
    comments: `${payment.comments ? `${payment.comments} | ` : ""}Dues cleared`
  };

  if (supabaseClient) {
    await updatePaymentCloud(updated);
    await loadCloudData();
  } else {
    upsertPaymentLocal(updated);
  }

  render();
  showToast("Dues cleared successfully");
}

async function deletePayment(paymentId) {
  if (!window.confirm("Delete this payment record?")) {
    return;
  }

  if (supabaseClient) {
    await deletePaymentCloud(paymentId);
    await loadCloudData();
  } else {
    state.payments = state.payments.filter((entry) => entry.id !== paymentId);
    persistLocalState();
  }

  resetPaymentForm();
  render();
  showToast("Payment deleted successfully");
}

function editSchedule(scheduleId) {
  const schedule = state.schedules.find((entry) => entry.id === scheduleId);
  if (!schedule) {
    return;
  }

  elements.scheduleId.value = schedule.id;
  elements.scheduleBatch.value = schedule.batchId;
  elements.scheduleLevel.value = schedule.level;
  elements.scheduleDay.value = schedule.day;
  elements.scheduleVenue.value = schedule.venue;
  elements.scheduleFromTime.value = schedule.fromTime;
  elements.scheduleToTime.value = schedule.toTime;
  elements.scheduleMessage.value = schedule.message;
  updateActionLabels();
  state.activeView = "scheduleView";
  updateActiveView();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

async function deleteSchedule(scheduleId) {
  if (!window.confirm("Delete this schedule?")) {
    return;
  }

  if (supabaseClient) {
    await deleteScheduleCloud(scheduleId);
    await loadCloudData();
  } else {
    state.schedules = state.schedules.filter((entry) => entry.id !== scheduleId);
    persistLocalState();
  }

  resetScheduleForm();
  render();
  showToast("Schedule deleted successfully");
}

function resetBatchForm() {
  elements.batchForm.reset();
  elements.batchId.value = "";
  elements.batchLevel.value = 1;
  updateActionLabels();
}

function resetPaymentForm() {
  elements.paymentForm.reset();
  elements.paymentId.value = "";
  elements.paymentLevel.value = 1;
  elements.paymentDues.value = 0;
  elements.paymentDate.value = todayDate();
  updateActionLabels();
}

function resetScheduleForm() {
  elements.scheduleForm.reset();
  elements.scheduleId.value = "";
  elements.scheduleLevel.value = "";
  updateActionLabels();
}

function updateActionLabels() {
  elements.batchSubmitButton.textContent = elements.batchId.value ? "Update Batch" : "Create Batch";
  elements.paymentSubmitButton.textContent = elements.paymentId.value ? "Update Payment" : "Record Payment";
  elements.scheduleSubmitButton.textContent = elements.scheduleId.value ? "Update Schedule" : "Save Schedule";
}

function updateSyncStatus(message, tone) {
  elements.syncStatus.textContent = message;
  elements.syncStatus.dataset.tone = tone;
}

function showToast(message, isError = false) {
  elements.toast.textContent = message;
  elements.toast.style.background = isError ? "rgba(157, 60, 52, 0.94)" : "rgba(47, 125, 93, 0.94)";
  elements.toast.hidden = false;
  window.clearTimeout(showToast.timeoutId);
  showToast.timeoutId = window.setTimeout(() => {
    elements.toast.hidden = true;
  }, 1000);
}

function handleWindowScroll() {
  elements.backToTopButton.classList.toggle("is-visible", window.scrollY > 240);
}

function handleBackToTop() {
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function mapStudentToDb(record) {
  return {
    id: record.id,
    surname: record.surname,
    last_name: record.lastName,
    gender: record.gender,
    dob: record.dob,
    father_name: record.fatherName,
    father_phone: record.fatherPhone,
    father_occupation: record.fatherOccupation,
    mother_name: record.motherName,
    mother_phone: record.motherPhone,
    mother_occupation: record.motherOccupation,
    school_name: record.schoolName,
    school_class: record.schoolClass,
    email: record.email,
    level: record.level
  };
}

function mapStudentFromDb(entry) {
  return {
    id: entry.id,
    surname: entry.surname,
    lastName: entry.last_name,
    gender: entry.gender,
    dob: entry.dob,
    fatherName: entry.father_name,
    fatherPhone: entry.father_phone,
    fatherOccupation: entry.father_occupation,
    motherName: entry.mother_name,
    motherPhone: entry.mother_phone,
    motherOccupation: entry.mother_occupation,
    schoolName: entry.school_name,
    schoolClass: entry.school_class,
    email: entry.email || "",
    level: Number(entry.level) || 1
  };
}

function groupBy(items, key) {
  return items.reduce((accumulator, item) => {
    const value = item[key];
    accumulator[value] = accumulator[value] || [];
    accumulator[value].push(item);
    return accumulator;
  }, {});
}

function formatStudentName(student) {
  if (!student) {
    return "Unknown student";
  }
  return `${student.surname} ${student.lastName}`.trim();
}

function formatDate(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" }).format(date);
}

function todayDate() {
  const now = new Date();
  const timezoneOffset = now.getTimezoneOffset() * 60000;
  return new Date(now.getTime() - timezoneOffset).toISOString().slice(0, 10);
}

function setDefaults() {
  elements.attendanceDate.value = todayDate();
  elements.attendanceDashboardDate.value = todayDate();
  elements.paymentDate.value = todayDate();
  elements.paymentLevel.value = 1;
  elements.paymentDues.value = 0;
  elements.studentLevel.value = 1;
  elements.batchLevel.value = 1;
  elements.combinedBatchLevel.value = 1;
}

function createSampleData() {
  const studentA = crypto.randomUUID();
  const studentB = crypto.randomUUID();
  const studentC = crypto.randomUUID();
  const studentD = crypto.randomUUID();
  const batchA = crypto.randomUUID();
  const batchB = crypto.randomUUID();
  const paymentA = crypto.randomUUID();
  const paymentB = crypto.randomUUID();
  const scheduleA = crypto.randomUUID();
  const scheduleB = crypto.randomUUID();
  const attendanceA = crypto.randomUUID();

  return {
    students: [
      {
        id: studentA,
        surname: "Reddy",
        lastName: "Ananya",
        gender: "Female",
        dob: "2015-04-14",
        fatherName: "Mahesh Reddy",
        fatherPhone: "9876543210",
        fatherOccupation: "Teacher",
        motherName: "Swathi Reddy",
        motherPhone: "9123456780",
        motherOccupation: "Homemaker",
        schoolName: "Kakatiya School",
        schoolClass: "5",
        email: "ananya@example.com",
        level: 1
      },
      {
        id: studentB,
        surname: "Kumar",
        lastName: "Vihaan",
        gender: "Male",
        dob: "2014-09-18",
        fatherName: "Ravi Kumar",
        fatherPhone: "9988776655",
        fatherOccupation: "Engineer",
        motherName: "Suma Kumar",
        motherPhone: "9000011111",
        motherOccupation: "Teacher",
        schoolName: "Kakatiya School",
        schoolClass: "6",
        email: "vihaan@example.com",
        level: 1
      },
      {
        id: studentC,
        surname: "Sharma",
        lastName: "Aarav",
        gender: "Male",
        dob: "2013-12-01",
        fatherName: "Rohit Sharma",
        fatherPhone: "9555544444",
        fatherOccupation: "Doctor",
        motherName: "Pooja Sharma",
        motherPhone: "9444433333",
        motherOccupation: "Accountant",
        schoolName: "Springdale School",
        schoolClass: "7",
        email: "aarav@example.com",
        level: 2
      },
      {
        id: studentD,
        surname: "Patel",
        lastName: "Mira",
        gender: "Female",
        dob: "2014-02-11",
        fatherName: "Jignesh Patel",
        fatherPhone: "9333322222",
        fatherOccupation: "Business",
        motherName: "Rina Patel",
        motherPhone: "9222211111",
        motherOccupation: "Designer",
        schoolName: "Springdale School",
        schoolClass: "6",
        email: "mira@example.com",
        level: 2
      }
    ],
    batches: [
      {
        id: batchA,
        name: "Level 1 - 10am Kakatiya",
        level: 1,
        notes: "Weekend beginners batch",
        studentIds: [studentA, studentB]
      },
      {
        id: batchB,
        name: "Level 2 - 12pm Kakatiya",
        level: 2,
        notes: "Intermediate batch",
        studentIds: [studentC, studentD]
      }
    ],
    attendance: [
      {
        id: attendanceA,
        batchId: batchA,
        attendanceDate: todayDate(),
        records: [
          { studentId: studentA, status: "Present" },
          { studentId: studentB, status: "Absent" }
        ]
      }
    ],
    payments: [
      {
        id: paymentA,
        studentId: studentA,
        batchId: batchA,
        level: 1,
        amount: 1500,
        dues: 250,
        mode: "Cash",
        comments: "Part payment",
        date: todayDate()
      },
      {
        id: paymentB,
        studentId: studentC,
        batchId: batchB,
        level: 2,
        amount: 1800,
        dues: 0,
        mode: "UPI",
        comments: "Paid in full",
        date: todayDate()
      }
    ],
    schedules: [
      {
        id: scheduleA,
        batchId: batchA,
        level: 1,
        day: "Saturday",
        venue: "Kakatiya School",
        fromTime: "10:00",
        toTime: "11:00",
        message: "Attend UCMAS ABACUS Level 1 - 10am Kakatiya CLASS at 10:00 to 11:00 at Kakatiya School."
      },
      {
        id: scheduleB,
        batchId: batchB,
        level: 2,
        day: "Sunday",
        venue: "Our Home",
        fromTime: "12:00",
        toTime: "13:00",
        message: "Attend UCMAS ABACUS Level 2 - 12pm Kakatiya CLASS at 12:00 to 13:00 at Our Home."
      }
    ]
  };
}
