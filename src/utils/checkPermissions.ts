import { userStore } from "../store/userStore";

export function userIsAdmin(groupMembers) {
    return groupMembers.some(member => 
        member.id === userStore.user?.id && member.is_admin
    );
}

export function userInGroup(groupMembers) {
    return groupMembers.some(member => member.id === userStore.user?.id);
}

export function userIsGroupOwner(group) {
    return group.admin_id === userStore.user?.id;
}