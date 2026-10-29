update storage.buckets
set public=false,
    file_size_limit=26214400,
    allowed_mime_types=array[
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/csv'
    ]
where id='dialog-reports';
