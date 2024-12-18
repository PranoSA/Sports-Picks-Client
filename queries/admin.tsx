/**
 * /api/v1/is_admin
 */

import { useQuery } from '@tanstack/react-query';

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

export default Use_is_admin;
