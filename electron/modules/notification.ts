import { Notification } from 'electron'
import path from 'path'

export function showNotification(title: string, body: string) {
  if (!Notification.isSupported()) {
    console.warn('Notifications are not supported on this platform')
    return
  }

  const notification = new Notification({
    title,
    body,
    icon: path.join(__dirname, '../../build/icon.png'),
    silent: false
  })

  notification.show()

  return notification
}
