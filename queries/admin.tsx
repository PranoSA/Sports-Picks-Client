/**
 * /api/v1/is_admin
 */

import { useMutation, useQuery } from '@tanstack/react-query';

const getToken = () => {
  return localStorage.getItem('accessToken');
};

const is_admin = async () => {
  const url = `${process.env.NEXT_PUBLIC_API_URL}/is_admin`;
  console.log('url', url);

  return await fetch(url, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  }).then((res) => res.json());
};

const Use_is_admin = () =>
  useQuery({
    queryKey: ['is_admin'],
    queryFn: is_admin,
  });

///admin/automatic_updates
const setAutomatedUpdates = async () => {
  const url = `${process.env.NEXT_PUBLIC_API_URL}/admin/automatic_updates`;
  console.log('url', url);

  return await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  }).then((res) => res.json());
};

export const UseSetAutomatedUpdates = () =>
  useMutation({
    mutationFn: setAutomatedUpdates,
    onSuccess: () => {
      console.log('Automated updates set');
    },
  });

export default Use_is_admin;
