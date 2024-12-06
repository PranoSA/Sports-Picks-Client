"use strict";
exports.__esModule = true;
var groups_1 = require("@/queries/groups");
var react_1 = require("react");
var fa_1 = require("react-icons/fa");
var scores_1 = require("@/queries/scores");
var GroupPad = function (_a) {
    var group = _a.group;
    var _b = groups_1.useGetGroupUsers(group.group_id), groupMembers = _b.data, isLoading = _b.isLoading, isError = _b.isError, error = _b.error;
    var _c = scores_1.useGetScoresForGroup(group.group_id), groupScores = _c.data, scoresError = _c.isError;
    react_1.useEffect(function () {
        console.log('Group Scores', groupScores);
    }, [groupScores]);
    var _d = react_1.useState(false), openMemberList = _d[0], setOpenMemberList = _d[1];
    react_1.useEffect(function () {
        console.log('Should Be ', openMemberList);
    }, [openMemberList]);
    //the member list component will show when the show member list button is clicked
    // it just shows the members of the group, nothing else
    var memberListComponent = react_1.useMemo(function () {
        if (!openMemberList) {
            return React.createElement("h1", { className: "text-2xl font-bold mb-4" }, "Members");
        }
        if (isLoading) {
            return React.createElement("div", null, "Loading...");
        }
        if (isError) {
            return React.createElement("div", null, "Error: ");
        }
        return (React.createElement("div", { className: "" },
            React.createElement("h1", { className: "text-2xl font-bold mb-4" }, "Members"),
            React.createElement("ul", { className: "space-y-4" }, groupMembers === null || groupMembers === void 0 ? void 0 : groupMembers.map(function (member) { return (React.createElement("li", { key: member.user_id },
                member.user_name,
                member.position === 'admin' && (React.createElement("span", { className: "text-yellow-500" },
                    React.createElement(fa_1.FaCrown, null))),
                member.position === 'member' && (React.createElement("span", { className: "text-gray-500" },
                    React.createElement(fa_1.FaUser, null))))); }))));
    }, [groupMembers, isError, isLoading, openMemberList]);
    return (React.createElement("div", { className: " w-full" },
        !openMemberList ? (React.createElement(fa_1.FaAngleDown, { onClick: function () { return setOpenMemberList(true); }, className: "cursor-pointer", size: 24 })) : (React.createElement(fa_1.FaAngleUp, { onClick: function () { return setOpenMemberList(false); }, className: "cursor-pointer", size: 24 })),
        memberListComponent));
};
exports["default"] = GroupPad;
