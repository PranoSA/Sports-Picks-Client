/**
 *
 * This file just exports the query client
 * so there is a consistent client for the
 */

import { QueryClient } from '@tanstack/react-query';

const queryClient = new QueryClient();

export default queryClient;
