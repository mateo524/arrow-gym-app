// Tiny bridge to break the circular dependency between useStore and useAuthStore.
// useAuthStore.js sets these after login; useStore.js reads them.
let _userId = null;
let _userProfile = null;

export function setAuthUserId(id) { _userId = id; }
export function getAuthUserId() { return _userId; }

export function setAuthProfile(profile) { _userProfile = profile; }
export function getAuthProfile() { return _userProfile; }
