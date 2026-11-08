// Store SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in Script Properties.
// Never share this script project or expose this key in the frontend.
function sendAppointmentEmails() {
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(1000)) return;
  try {
    const props = PropertiesService.getScriptProperties();
    const base = props.getProperty('SUPABASE_URL');
    const key = props.getProperty('SUPABASE_SERVICE_ROLE_KEY');
    if (!base || !key) throw new Error('Missing Script Properties');
    const headers = {apikey:key, Authorization:'Bearer '+key};
    const url = base + '/rest/v1/appointment_email_queue';
    const response = UrlFetchApp.fetch(url+'?sent_at=is.null&order=created_at.asc&limit=20', {headers:headers});
    const rows = JSON.parse(response.getContentText());
    for (const row of rows) {
      if (MailApp.getRemainingDailyQuota() < 1) break;
      MailApp.sendEmail({to:row.recipient,subject:row.subject,body:row.body,name:'Aether Hospital'});
      // Stop if acknowledgement fails; inspect before retrying to avoid duplicates.
      UrlFetchApp.fetch(url+'?id=eq.'+encodeURIComponent(row.id), {
        method:'patch', headers:headers, contentType:'application/json',
        payload:JSON.stringify({sent_at:new Date().toISOString()})
      });
    }
  } finally { lock.releaseLock(); }
}
