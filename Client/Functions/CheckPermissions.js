export default function CheckPermissions(status,session, perm) {



    if (status === 'authenticated' && session.user.roleId) {
        
        fetch(`/api/getRole?id=${session.user.roleId}`)
          .then((response) => response.json())
          .then((data) => {
            if (data.role) {
              if (data.permissions[perm] !== true) {
                if (data.role !== "admin") {
                    return false
                } else {
                    return true 
                }
              }
            } else {
                return true
            }
          })
          .catch((error) => {
            console.error('Error fetching role:', error);
            return false
          });
      }



}