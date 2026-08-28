import { DriveFileItem } from '../types';

const DRIVE_API_BASE = 'https://www.googleapis.com/drive/v3';
const DRIVE_UPLOAD_BASE = 'https://www.googleapis.com/upload/drive/v3';

/**
 * List files & folders from Google Drive
 */
export async function listDriveFiles(
  accessToken: string,
  folderId: string = 'root',
  searchTerm: string = ''
): Promise<DriveFileItem[]> {
  try {
    let q = `'${folderId}' in parents and trashed = false`;
    if (searchTerm.trim()) {
      q += ` and name contains '${searchTerm.replace(/'/g, "\\'")}'`;
    }

    const fields = 'files(id, name, mimeType, thumbnailLink, webViewLink, webContentLink, size, createdTime, modifiedTime, iconLink, parents)';
    const orderBy = 'folder,modifiedTime desc';

    const url = `${DRIVE_API_BASE}/files?q=${encodeURIComponent(q)}&fields=${encodeURIComponent(fields)}&orderBy=${encodeURIComponent(orderBy)}&pageSize=100`;

    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/json',
      },
    });

    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      throw new Error(errJson.error?.message || `Google Drive API error: ${res.statusText}`);
    }

    const data = await res.json();
    const files: any[] = data.files || [];

    return files.map((f) => ({
      id: f.id,
      name: f.name,
      mimeType: f.mimeType,
      thumbnailLink: f.thumbnailLink,
      webViewLink: f.webViewLink,
      webContentLink: f.webContentLink,
      size: f.size,
      createdTime: f.createdTime,
      modifiedTime: f.modifiedTime,
      iconLink: f.iconLink,
      parents: f.parents,
      isFolder: f.mimeType === 'application/vnd.google-apps.folder',
    }));
  } catch (error) {
    console.error('Error listing Google Drive files:', error);
    throw error;
  }
}

/**
 * Create a new folder in Google Drive
 */
export async function createDriveFolder(
  accessToken: string,
  folderName: string,
  parentFolderId?: string
): Promise<DriveFileItem> {
  try {
    const metadata: { name: string; mimeType: string; parents?: string[] } = {
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder',
    };

    if (parentFolderId && parentFolderId !== 'root') {
      metadata.parents = [parentFolderId];
    }

    const res = await fetch(`${DRIVE_API_BASE}/files?fields=id,name,mimeType,webViewLink,createdTime`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(metadata),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || `Failed to create folder: ${res.statusText}`);
    }

    const data = await res.json();
    return {
      id: data.id,
      name: data.name,
      mimeType: data.mimeType,
      webViewLink: data.webViewLink,
      createdTime: data.createdTime,
      isFolder: true,
    };
  } catch (error) {
    console.error('Error creating Google Drive folder:', error);
    throw error;
  }
}

/**
 * Upload a file (Photo, RAW, Video, Document) to Google Drive using multipart upload
 */
export async function uploadFileToDrive(
  accessToken: string,
  file: File,
  parentFolderId?: string
): Promise<DriveFileItem> {
  try {
    const metadata: { name: string; parents?: string[] } = {
      name: file.name,
    };

    if (parentFolderId && parentFolderId !== 'root') {
      metadata.parents = [parentFolderId];
    }

    const boundary = '-------314159265358979323846';
    const delimiter = `\r\n--${boundary}\r\n`;
    const closeDelimiter = `\r\n--${boundary}--`;

    const metadataPart = `${delimiter}Content-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(metadata)}`;
    const mediaPartHeader = `${delimiter}Content-Type: ${file.type || 'application/octet-stream'}\r\n\r\n`;

    const metadataBlob = new Blob([metadataPart], { type: 'text/plain' });
    const mediaHeaderBlob = new Blob([mediaPartHeader], { type: 'text/plain' });
    const closeBlob = new Blob([closeDelimiter], { type: 'text/plain' });

    const multipartBlob = new Blob([metadataBlob, mediaHeaderBlob, file, closeBlob], {
      type: `multipart/related; boundary=${boundary}`,
    });

    const res = await fetch(
      `${DRIVE_UPLOAD_BASE}/files?uploadType=multipart&fields=id,name,mimeType,thumbnailLink,webViewLink,size,createdTime`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': `multipart/related; boundary=${boundary}`,
        },
        body: multipartBlob,
      }
    );

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || `Failed to upload file to Google Drive: ${res.statusText}`);
    }

    const data = await res.json();
    return {
      id: data.id,
      name: data.name,
      mimeType: data.mimeType,
      thumbnailLink: data.thumbnailLink,
      webViewLink: data.webViewLink,
      size: data.size,
      createdTime: data.createdTime,
      isFolder: false,
    };
  } catch (error) {
    console.error('Error uploading file to Google Drive:', error);
    throw error;
  }
}

/**
 * Delete a file or folder in Google Drive (Destructive operation - MUST require user confirmation dialog before calling)
 */
export async function deleteDriveFile(
  accessToken: string,
  fileId: string
): Promise<void> {
  try {
    const res = await fetch(`${DRIVE_API_BASE}/files/${fileId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!res.ok && res.status !== 204) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || `Failed to delete file: ${res.statusText}`);
    }
  } catch (error) {
    console.error('Error deleting Google Drive file:', error);
    throw error;
  }
}

/**
 * Make file or folder shareable with link (anyone with link can view)
 */
export async function makeFilePubliclyViewable(
  accessToken: string,
  fileId: string
): Promise<string> {
  try {
    await fetch(`${DRIVE_API_BASE}/files/${fileId}/permissions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        role: 'reader',
        type: 'anyone',
      }),
    });

    return `https://drive.google.com/drive/folders/${fileId}`;
  } catch (error) {
    console.warn('Failed to set public permission on Google Drive folder:', error);
    return `https://drive.google.com/drive/folders/${fileId}`;
  }
}

/**
 * Setup a complete photography deliverable folder structure for a client order
 */
export async function createClientOrderFolderStructure(
  accessToken: string,
  clientName: string,
  orderId: string,
  packageName: string
): Promise<{
  mainFolderId: string;
  mainFolderUrl: string;
  subfolders: { name: string; id: string; url: string }[];
}> {
  const rootFolderName = `[Dimensi Foto] ${clientName} - ${packageName} (${orderId})`;
  
  // 1. Create main order folder
  const mainFolder = await createDriveFolder(accessToken, rootFolderName);
  
  // 2. Make it viewable so client can access photo results
  await makeFilePubliclyViewable(accessToken, mainFolder.id);

  // 3. Create subfolder structure
  const subfolderNames = [
    '01_Hasil_Foto_Edited_HiRes',
    '02_File_Mentahan_RAW',
    '03_Pilihan_Cetak_Kanvas_Album',
    '04_Teaser_Video_Reels',
  ];

  const subfolders: { name: string; id: string; url: string }[] = [];

  for (const name of subfolderNames) {
    try {
      const sub = await createDriveFolder(accessToken, name, mainFolder.id);
      subfolders.push({
        name,
        id: sub.id,
        url: sub.webViewLink || `https://drive.google.com/drive/folders/${sub.id}`,
      });
    } catch (e) {
      console.warn(`Could not create subfolder ${name}:`, e);
    }
  }

  return {
    mainFolderId: mainFolder.id,
    mainFolderUrl: mainFolder.webViewLink || `https://drive.google.com/drive/folders/${mainFolder.id}`,
    subfolders,
  };
}
