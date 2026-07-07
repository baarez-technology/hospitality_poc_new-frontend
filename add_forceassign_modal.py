"""Add ForceAssignModal to Housekeeping.tsx"""

file_path = 'E:/Glimmora_Updated/Frontend/src/pages/admin/Housekeeping.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Add ForceAssignModal before Toast
old_toast = """{/* Scan Digital Key Modal */}
      <ScanDigitalKeyModal
        open={isScanKeyModalOpen}
        onClose={() => setIsScanKeyModalOpen(false)}
        roomNumber={selectedRoom?.number}
      />

      {/* Toast Notifications */}"""

new_toast = """{/* Scan Digital Key Modal */}
      <ScanDigitalKeyModal
        open={isScanKeyModalOpen}
        onClose={() => setIsScanKeyModalOpen(false)}
        roomNumber={selectedRoom?.number}
      />

      {/* Force Assign Modal */}
      <ForceAssignModal
        isOpen={isForceAssignModalOpen}
        onClose={() => {
          setIsForceAssignModalOpen(false);
          setTaskForForceAssign(null);
        }}
        onForceAssign={async (staffId, reason, requireAcceptance) => {
          try {
            if (taskForForceAssign) {
              await api.post(`/housekeeping/tasks/${taskForForceAssign.id}/force-assign`, {
                staff_id: staffId,
                reason: reason,
                require_acceptance: requireAcceptance
              });
              showToast('Task force-assigned successfully', 'success');
            }
            setIsForceAssignModalOpen(false);
          } catch (err) {
            showToast('Failed to force-assign task', 'error');
          }
        }}
        taskType="housekeeping"
        taskId={taskForForceAssign?.id || ''}
        taskDescription={taskForForceAssign?.notes || 'Housekeeping Task'}
        busyStaff={staffAvailability.busyStaff}
        availableStaff={staffAvailability.availableStaff}
      />

      {/* Toast Notifications */}"""

if old_toast in content:
    content = content.replace(old_toast, new_toast)
    print('Added ForceAssignModal')
else:
    print('Toast section not found - may already be updated')

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print('Done')
