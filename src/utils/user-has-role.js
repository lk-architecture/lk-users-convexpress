export default function userHasRole (user, role) {
    return user.roles.indexOf(role) !== -1;
}
