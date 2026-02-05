// frontend/src/components/customers/DocumentUpload.jsx
import React, { useState } from 'react';
import { Upload, Button, Card, List, Tag, Modal, Space } from '@components/ui';
import { ProgressBar } from '@/components/shared';
import { Upload as UploadIcon, FileText, Image, X, Eye, Download, CheckCircle } from 'lucide-react';

const DocumentUpload = ({
  customerId,
  existingDocuments = [],
  onUpload,
  onDelete,
  readOnly = false,
}) => {
  const [uploadingFiles, setUploadingFiles] = useState({});
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState('');

  const documentTypes = [
    { value: 'NATIONAL_ID', label: 'National ID', icon: <FileText /> },
    { value: 'PASSPORT', label: 'Passport', icon: <FileText /> },
    { value: 'DRIVERS_LICENSE', label: 'Driver\'s License', icon: <FileText /> },
    { value: 'KRA_PIN', label: 'KRA PIN', icon: <FileText /> },
    { value: 'PAYSLIP', label: 'Payslip', icon: <FileText /> },
    { value: 'BANK_STATEMENT', label: 'Bank Statement', icon: <FileText /> },
    { value: 'UTILITY_BILL', label: 'Utility Bill', icon: <FileText /> },
    { value: 'LETTER_OF_EMPLOYMENT', label: 'Employment Letter', icon: <FileText /> },
    { value: 'BUSINESS_REGISTRATION', label: 'Business Registration', icon: <FileText /> },
    { value: 'PROOF_OF_RESIDENCE', label: 'Proof of Residence', icon: <FileText /> },
    { value: 'PASSPORT_PHOTO', label: 'Passport Photo', icon: <Image /> },
    { value: 'SIGNATURE', label: 'Signature', icon: <FileText /> },
    { value: 'OTHER', label: 'Other', icon: <FileText /> },
  ];

  const handleUpload = ({ file, onSuccess, onError }) => {
    // Initialize progress
    setUploadingFiles(prev => ({ ...prev, [file.uid]: 0 }));

    // Simulate upload with interval
    const interval = setInterval(() => {
      setUploadingFiles(prev => {
        const progress = prev[file.uid] + 10;
        if (progress >= 100) {
          clearInterval(interval);

          // Create mock document object
          const docData = {
            id: Date.now(),
            name: file.name,
            type: documentTypes[0].value,
            size: file.size,
            upload_date: new Date().toISOString(),
            verification_status: 'PENDING',
            uploaded_by: 'Current User',
          };

          onUpload?.(docData);

          setTimeout(() => {
            setUploadingFiles(prevFiles => {
              const updated = { ...prevFiles };
              delete updated[file.uid];
              return updated;
            });
          }, 1000);

          onSuccess?.('Upload complete');
        }
        return { ...prev, [file.uid]: Math.min(progress, 100) };
      });
    }, 200);
  };

  const handlePreview = (file) => {
    if (file.url) {
      setPreviewImage(file.url);
      setPreviewVisible(true);
    }
  };

  const handleDelete = (documentId) => {
    onDelete?.(documentId);
  };

  const renderDocumentItem = (doc) => {
    const isImage = doc.name?.match(/\.(jpg|jpeg|png|gif)$/i);

    const getStatusColor = (status) => {
      switch (status) {
        case 'VERIFIED': return 'green';
        case 'REJECTED': return 'red';
        case 'PENDING': return 'yellow';
        default: return 'gray';
      }
    };

    return (
      <List.Item
        key={doc.id}
        actions={[
          <Button key="view" type="text" icon={<Eye size={16} />} onClick={() => handlePreview(doc)} />,
          <Button key="download" type="text" icon={<Download size={16} />} href={doc.url} download />,
          !readOnly && (
            <Button key="delete" type="text" danger icon={<X size={16} />} onClick={() => handleDelete(doc.id)} />
          ),
        ].filter(Boolean)}
      >
        <List.Item.Meta
          avatar={<div className="text-blue-600">{isImage ? <Image size={20} /> : <FileText size={20} />}</div>}
          title={
            <div className="flex items-center justify-between">
              <span className="font-medium">{doc.name}</span>
              <Tag color={getStatusColor(doc.verification_status)}>
                {doc.verification_status}
              </Tag>
            </div>
          }
          description={
            <div className="space-y-1">
              <div className="text-sm text-gray-500">Uploaded: {new Date(doc.upload_date).toLocaleDateString()}</div>
              <div className="text-sm text-gray-500">Size: {(doc.size / 1024 / 1024).toFixed(2)} MB</div>
              {doc.verified_by && (
                <div className="text-sm text-green-600">
                  <CheckCircle size={12} className="inline mr-1" /> Verified by: {doc.verified_by}
                </div>
              )}
            </div>
          }
        />
      </List.Item>
    );
  };

  return (
    <Card title="Documents">
      {!readOnly && (
        <div className="mb-6">
          <Upload.Dragger
            customRequest={handleUpload}
            multiple
            showUploadList={false}
            disabled={Object.keys(uploadingFiles).length > 0}
          >
            <div className="py-8 text-center">
              <UploadIcon size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-lg font-medium mb-2">Click or drag files to upload</p>
              <p className="text-gray-500 text-sm">Supports multiple files. Max file size: 10MB</p>
            </div>
          </Upload.Dragger>

          {/* Upload progress bars */}
          <div className="mt-4 space-y-2">
            {Object.entries(uploadingFiles).map(([uid, percent]) => (
              <ProgressBar
                key={uid}
                value={percent}
                size="md"
                showLabel
                animated
                variant="primary"
                showAnimation
              />
            ))}
          </div>
        </div>
      )}

      {/* Existing documents list */}
      <List
        dataSource={existingDocuments}
        renderItem={renderDocumentItem}
        locale={{ emptyText: 'No documents uploaded' }}
      />

      {/* Preview modal */}
      <Modal open={previewVisible} footer={null} onCancel={() => setPreviewVisible(false)} width="80%">
        <img alt="Document Preview" className="w-full" src={previewImage} />
      </Modal>
    </Card>
  );
};

export default DocumentUpload;
