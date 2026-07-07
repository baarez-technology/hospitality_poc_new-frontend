"""Add new routes for TaskAcceptance and TechnicianSpecializations"""

file_path = 'E:/Glimmora_Updated/Frontend/src/App.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Check if already added
if 'TechnicianSpecializations' in content:
    print('Routes already added')
    exit(0)

# Add lazy import for TechnicianSpecializations
old_import = "const StaffNotifications = lazy(() => import('./pages/staff-portal/notifications/Notifications'));"
new_import = """const StaffNotifications = lazy(() => import('./pages/staff-portal/notifications/Notifications'));
const TechnicianSpecializations = lazy(() => import('./pages/admin/TechnicianSpecializations'));
const StaffTaskAcceptance = lazy(() => import('./pages/staff/TaskAcceptance'));"""

if old_import in content:
    content = content.replace(old_import, new_import)
    print('Added lazy imports')

# Add route for TechnicianSpecializations in admin section
old_route = """<Route path="ai/crm" element={<CRMAI />} />
                              </Route>"""
new_route = """<Route path="ai/crm" element={<CRMAI />} />
                                {/* Maintenance Specializations */}
                                <Route path="maintenance/specializations" element={<TechnicianSpecializations />} />
                              </Route>"""

if old_route in content:
    content = content.replace(old_route, new_route)
    print('Added TechnicianSpecializations route')

# Add route for TaskAcceptance in staff portal
old_staff_route = """{/* Common routes (accessible from any role) */}
                                  <Route path="profile" element={<StaffPortalProfile />} />"""
new_staff_route = """{/* Task Acceptance (for force-assigned tasks) */}
                                  <Route path="tasks/pending" element={<StaffTaskAcceptance />} />

                                  {/* Common routes (accessible from any role) */}
                                  <Route path="profile" element={<StaffPortalProfile />} />"""

if old_staff_route in content:
    content = content.replace(old_staff_route, new_staff_route)
    print('Added TaskAcceptance route')

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print('Routes added successfully')
