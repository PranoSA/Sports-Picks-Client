'use client';
"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
exports.__esModule = true;
//login
var react_1 = require("next-auth/react");
var link_1 = require("next/link");
var admin_1 = require("@/queries/admin");
var groups_1 = require("@/queries/groups");
var react_query_1 = require("@tanstack/react-query");
var queryclient_1 = require("@/queries/queryclient");
var react_2 = require("react");
var Create_Group_Form_1 = require("@/components/Create_Group_Form");
var GroupMemberDropdown_1 = require("@/components/GroupMemberDropdown");
var GroupStore_1 = require("@/components/GroupStore");
//import react/fa-icons for dropdown and up and down arrows
var fa_1 = require("react-icons/fa");
var HomeWithSessionProvider = function () {
    var sessionProviderProps = {
        children: React.createElement(HomeWithQueryProvider, null)
    };
    return React.createElement(react_1.SessionProvider, __assign({}, sessionProviderProps));
};
var HomeWithQueryProvider = function () {
    return (React.createElement(react_query_1.QueryClientProvider, { client: queryclient_1["default"] },
        React.createElement(Home, null)));
};
function Home() {
    //if not authenticated, login to keycloak provider
    //const { data: session } = useSession() as { data: Session | null };
    var _a = react_1.useSession(), session = _a.data, status = _a.status;
    console.log('session', session);
    //set to dark mode
    react_2.useEffect(function () {
        document.body.classList.add('dark');
    }, []);
    react_2.useEffect(function () {
        //set local storage bearer token
        if (typeof window !== 'undefined' && session) {
            localStorage.setItem('accessToken', session.accessToken);
            //set date_redeemed -> store unix timestamp
            var now_time = Date.now();
            var unix_time = Math.floor(now_time / 1000);
            localStorage.setItem('date_redeemed', unix_time.toString());
        }
    }, [session]);
    var is_admin = admin_1["default"]().data;
    console.log('Is Admin?', is_admin === null || is_admin === void 0 ? void 0 : is_admin.is_admin);
    if (!session) {
        return (React.createElement("div", { className: "grid place-items-center h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100" },
            React.createElement("div", { className: "text-center p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-md" },
                React.createElement("h1", { className: "text-3xl font-bold mb-4" }, "Welcome to Sports Betting App"),
                React.createElement("p", { className: "mb-6" }, "This app allows you to create groups, make choices, and track your bets. Join now and start making your picks!"),
                React.createElement("button", { onClick: function () { return react_1.signIn('keycloak'); }, className: "p-4 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600 transition duration-300" }, "Login"))));
    }
    return (React.createElement("div", { className: "flex flex-col p-4 dark:bg-black" },
        //if is admin, show admin panel
        (is_admin === null || is_admin === void 0 ? void 0 : is_admin.is_admin) && React.createElement(AdminPanel, null),
        React.createElement(ListOfGroupsComponent, null)));
}
var ListOfGroupsComponent = function () {
    var _a = groups_1.useGetGroups(), groups = _a.data, isLoading = _a.isLoading, isError = _a.isError, error = _a.error;
    var openCreateGroup = function () {
        GroupStore_1["default"].setState({ adding_group: true });
    };
    if (isLoading) {
        return React.createElement("div", null, "Loading...");
    }
    if (isError) {
        return React.createElement("div", null, "Error: ");
    }
    return (React.createElement("div", { className: "p-4 flex flex-col items-center dark:bg-gray-800" },
        React.createElement("h1", { className: "text-2xl font-bold mb-4 dark:text-white" }, "Add a Group"),
        React.createElement("button", { onClick: openCreateGroup, className: "mb-4 p-2 bg-blue-500 text-white rounded dark:text-black" }, "Create Group"),
        React.createElement("div", { className: "w-full max-w-md" },
            React.createElement(Create_Group_Form_1["default"], null)),
        React.createElement("h1", { className: "text-2xl font-bold mb-4 dark:text-white" }, "Groups"),
        React.createElement("ul", { className: "w-full max-w-md space-y-4 flex flex-wrap flex-row" }, groups === null || groups === void 0 ? void 0 : groups.map(function (group) { return (React.createElement("li", { key: group.group_id, className: "flex flex-wrap p-4 border rounded bg-white dark:bg-gray-600 shadow-md w-full max-w-1/2" },
            React.createElement(link_1["default"], { href: "/group/" + group.group_id },
                React.createElement("div", { className: "flex flex-row w-full" },
                    React.createElement("h1", { className: "text-xl font-bold dark:text-white m-3" }, group.group_name),
                    React.createElement(fa_1.FaExternalLinkAlt, { size: 16, className: "cursor-pointer text-blue-500" }))),
            React.createElement(GroupMemberDropdown_1["default"], { group: group }))); }))));
};
var AdminPanel = function () {
    /**
     * All this panel will do will have a a link to /admin/year
     *
     *
     *
     */
    return (React.createElement("div", { className: "flex flex-col p-4 dark:bg-black" },
        React.createElement(link_1["default"], { href: "/admin", className: "\n        cursor\n        hover:bg-blue-500 hover:text-white p-2 rounded-lg shadow-md bg-blue-400 text-white" },
            React.createElement("h1", { className: "text-2xl font-bold mb-4 dark:text-white" }, "Admin Panel"))));
};
exports["default"] = HomeWithSessionProvider;
