// Allowed to use 'class' structure on server if
// "use strict included."
"use strict";
const UserRepo       = require('../Data/UserRepo');
const _userRepo      = new UserRepo();

class RequestService {
    constructor() {
    }

    async  jwtReqHelper(req, permittedRoles=[]) {
        let rolePermitted = false;

        // Send username and login status to view if authenticated.
        if(req.isAuthenticated()) {
            let roles = await _userRepo.getRolesByUsername(req.user.username);
            if(permittedRoles.length > 0) {
                // Check for overlap between user's role array with roles
                // permitted for the controller.

                if(roles.length > 0) {
                    let matchingRoles = roles.filter( x=>permittedRoles.includes(x));
                    if(matchingRoles.length > 0) {
                        rolePermitted = true;
                    }
                    return { authenticated: true, username : req.user.username,
                        roles:roles, rolePermitted:rolePermitted};
                }
            }
            return { authenticated: true, username : req.user.username, roles:roles,
                rolePermitted:rolePermitted};
        }
        // Send logged out status to form if not authenticated.
        else {
            return { authenticated: false };
        }
    }

    reqHelper(req, permittedRoles=[]) {
        let rolePermitted = false;
    
        // Send username and login status to view if authenticated.
        if(req.isAuthenticated()) {
            
            if(permittedRoles.length > 0) {
                // Check for overlap between user's role array with roles 
                // permitted for the controller.
                let matchingRoles = req.session.roles.filter(
                                            x=>permittedRoles.includes(x));
                if(matchingRoles.length > 0) {
                    rolePermitted = true;
                }
            }
            
            return { authenticated: true, username : req.user.username, 
                        roles:req.session.roles, rolePermitted:rolePermitted};
        }
        // Send logged out status to form if not authenticated.
        else {
            return { authenticated: false };
        }
    }
    
}
module.exports = new RequestService();
