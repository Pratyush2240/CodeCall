import API from './axios';

/** GET current user profile */
export const getProfile = () =>
  API.get('/user/profile').then((r) => r.data.data);

/** GET recent collaborators */
export const getRecentCollaborators = () =>
  API.get('/user/recent-collaborators').then((r) => r.data.data);

/** PATCH profile (fullName, username) */
export const updateProfile = (data) =>
  API.patch('/user/profile', data).then((r) => r.data.data);

/** PATCH change/add password */
export const changePassword = (data) =>
  API.patch('/user/change-password', data).then((r) => r.data);

/** DELETE account permanent */
export const deleteAccount = (password) =>
  API.delete('/user/delete-account', { data: { password } }).then((r) => r.data);
