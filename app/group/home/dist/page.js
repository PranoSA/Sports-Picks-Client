"use strict";
/**
 *
 * List All your groups here
 * Links so you can navigate to the group page
 */
exports.__esModule = true;
var groups_1 = require("@/queries/groups");
var react_query_1 = require("@tanstack/react-query");
var queryclient_1 = require("@/queries/queryclient");
var link_1 = require("next/link");
var PageWithProvider = function () {
    return (React.createElement(react_query_1.QueryClientProvider, { client: queryclient_1["default"] },
        React.createElement(GroupsPage, null)));
};
function GroupsPage() {
    var _a = groups_1.useGetGroups(), data = _a.data, isLoading = _a.isLoading, isError = _a.isError;
    if (isLoading) {
        return React.createElement("div", null, "Loading...");
    }
    if (isError) {
        return React.createElement("div", null, "Error fetching groups");
    }
    if (!data) {
        return React.createElement("div", null, "No groups found");
    }
    return (React.createElement("div", null,
        React.createElement("h1", null, "Groups"),
        React.createElement("ul", null, data.map(function (group) { return (React.createElement("li", { key: group.group_id },
            React.createElement(link_1["default"], { href: "/group/" + group.group_id }, group.name))); }))));
}
exports["default"] = PageWithProvider;
