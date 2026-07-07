"""Script to add ForceAssign and StaffAvailabilityAlert to Housekeeping.tsx"""

file_path = 'E:/Glimmora_Updated/Frontend/src/pages/admin/Housekeeping.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Check if already updated
if 'ForceAssignModal' in content:
    print('ForceAssignModal already imported in Housekeeping.tsx')
    exit(0)

# Update imports
old_imports = """import { useState, useMemo } from 'react';
import { ArrowUpDown, Plus, Wand2, Download, RefreshCw, LayoutGrid, Table as TableIcon, Loader2, QrCode } from 'lucide-react';"""

new_imports = """import { useState, useMemo, useEffect } from 'react';
import { ArrowUpDown, Plus, Wand2, Download, RefreshCw, LayoutGrid, Table as TableIcon, Loader2, QrCode, AlertTriangle } from 'lucide-react';"""

if old_imports in content:
    content = content.replace(old_imports, new_imports)
    print('Updated react and lucide imports')

# Add new component imports
old_import_line = """import { ScanDigitalKeyModal } from '../../components/housekeeping/modals/ScanDigitalKeyModal';
import Toast from '../../components/common/Toast';"""

new_import_line = """import { ScanDigitalKeyModal } from '../../components/housekeeping/modals/ScanDigitalKeyModal';
import { ForceAssignModal } from '../../components/common/ForceAssignModal';
import { StaffAvailabilityAlert } from '../../components/common/StaffAvailabilityAlert';
import Toast from '../../components/common/Toast';"""

if old_import_line in content:
    content = content.replace(old_import_line, new_import_line)
    print('Added ForceAssignModal and StaffAvailabilityAlert imports')

# Add api import after SORTABLE_FIELDS
old_sortable = """import { SORTABLE_FIELDS } from '../../utils/housekeepingSort';

export default function Housekeeping()"""

new_sortable = """import { SORTABLE_FIELDS } from '../../utils/housekeepingSort';
import api from '../../services/api';

export default function Housekeeping()"""

if old_sortable in content:
    content = content.replace(old_sortable, new_sortable)
    print('Added api import')

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print('Housekeeping.tsx updated successfully')
