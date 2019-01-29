!macro customInstall
  DetailPrint "Register tel URI Handler"
  WriteRegStr HKCU "SOFTWARE\Classes\callto" "" "URL:callto"
  WriteRegStr HKCU "SOFTWARE\Classes\callto" "URL Protocol" ""
  WriteRegStr HKCU "SOFTWARE\Classes\tel" "" "URL:tel"
  WriteRegStr HKCU "SOFTWARE\Classes\tel" "URL Protocol" ""
  WriteRegStr HKCU "SOFTWARE\Classes\dialer.callto\Shell\Open\Command" "" "$INSTDIR\${APP_EXECUTABLE_FILENAME} %1"
  WriteRegStr HKCU "SOFTWARE\Dialer\Capabilities" "ApplicationDescription" "Dialer"
  WriteRegStr HKCU "SOFTWARE\Dialer\Capabilities" "ApplicationName" "Dialer"
  WriteRegStr HKCU "SOFTWARE\Dialer\Capabilities\URLAssociations" "callto" "dialer.callto"
  WriteRegStr HKCU "SOFTWARE\Dialer\Capabilities\URLAssociations" "tel" "dialer.callto"
  WriteRegStr HKCU "SOFTWARE\RegisteredApplications" "Dialer" "Software\\Dialer\\Capabilities"
!macroend