const MAX_BACKUPS = 180;
const DRY_RUN = false;

async function listAllBackups(drive, folderId) {
  const files = [];
  let pageToken = null;

  do {
    const response = await drive.files.list({
      q: `'${folderId}' in parents and trashed = false`,
      fields: 'nextPageToken, files(id,name,createdTime)',
      pageSize: 1000,
      orderBy: 'createdTime desc',
      supportsAllDrives: true,
      includeItemsFromAllDrives: true,
      pageToken: pageToken || undefined,
    });

    if (response.data.files) {
      files.push(...response.data.files);
    }

    pageToken = response.data.nextPageToken;
  } while (pageToken);

  return files;
}

function printFilePreview(title, files, limit = 10) {
  console.log(`---------- ${title} ----------`);
  files.slice(0, limit).forEach((file, index) => {
    console.log(`${index + 1}. ${file.name}`);
  });
  if (files.length > limit) {
    console.log(`... and ${files.length - limit} more`);
  }
}

async function cleanupOldBackups(drive, folderId) {
  const files = await listAllBackups(drive, folderId);

  files.sort((a, b) => new Date(b.createdTime) - new Date(a.createdTime));

  const totalBackups = files.length;
  const backupsToKeep = Math.min(totalBackups, MAX_BACKUPS);
  const filesToKeep = files.slice(0, MAX_BACKUPS);
  const filesToDelete = files.slice(MAX_BACKUPS);
  const backupsToDelete = filesToDelete.length;

  console.log(`[Cleanup] Total backups found: ${totalBackups}`);
  console.log(`[Cleanup] Keeping latest: ${backupsToKeep}`);

  if (DRY_RUN) {
    console.log(`[Cleanup] DRY RUN: true`);
  }

  if (filesToKeep.length > 0) {
    printFilePreview('KEEP', filesToKeep);
  }

  if (backupsToDelete === 0) {
    console.log('[Cleanup] Backup cleanup skipped. No files to delete.');
    return { totalBackups, deletedCount: 0, skipped: true };
  }

  if (filesToDelete.length > 0) {
    printFilePreview('DELETE', filesToDelete);
  }

  if (DRY_RUN) {
    console.log('[DRY RUN] Would delete:');
    for (const file of filesToDelete) {
      console.log(file.name);
    }
    console.log('[DRY RUN] No files were actually deleted.');
    console.log(`[Cleanup] Deleted: 0 old backups (DRY RUN)`);
    return { totalBackups, deletedCount: 0, dryRun: true };
  }

  let deletedCount = 0;

  for (const file of filesToDelete) {
    try {
      console.log(`[Cleanup] Deleting: ${file.name}`);
      await drive.files.delete({
        fileId: file.id,
        supportsAllDrives: true,
      });
      deletedCount++;
    } catch (err) {
      console.error(`[Cleanup] Failed to delete ${file.name}:`, err.message || err);
    }
  }

  console.log(`[Cleanup] Deleted: ${deletedCount} old backups`);
  return { totalBackups, deletedCount, dryRun: false };
}

module.exports = cleanupOldBackups;
