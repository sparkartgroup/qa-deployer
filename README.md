Designed to be run whenever a pull request is opened or when commits are pushed to a branch, this script:

 - Checks the Modulus API for a project named after the branch

 - Creates a project named after the branch if one doesn’t already exist
 
 - Deploy to the newly created project and see what what *.onmodulus.net domain is provisioned afterwards
 
 - Prefix pull request description with the *.onmodulus.net domain
 
 - If a matching project is found, deploy to it and skip other steps
