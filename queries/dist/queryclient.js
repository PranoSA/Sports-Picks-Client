"use strict";
/**
 *
 * This file just exports the query client
 * so there is a consistent client for the
 */
exports.__esModule = true;
var react_query_1 = require("@tanstack/react-query");
var queryClient = new react_query_1.QueryClient();
exports["default"] = queryClient;
