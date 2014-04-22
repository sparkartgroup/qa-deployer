var ORG = process.env.CIRCLE_PROJECT_USERNAME,
    REPO = process.env.CIRCLE_PROJECT_REPONAME,
    BRANCH = process.env.CIRCLE_BRANCH,
    MODULUS_TOKEN = process.env.MODULUS_TOKEN,
    GITHUB_TOKEN = process.env.GITHUB_TOKEN,
    DOMAIN = '',
    PROJECT,
    PR

var spawn = require('child_process').spawn,
    request = require('request'),
    color = require('cli-color')

var user_agent = { "User-Agent": "Sparkart Site Deployer" },
    github_auth = { "user": "pushred", "pass": GITHUB_TOKEN, "sendImmediately": true }

var update = color.xterm(44),
    success = color.xterm(49),
    error = color.xterm(202),
    warn = color.xterm(220)

var addUrl = function(){

    // Get domain
    request.get('https://sparkart-api.curvature.io/user/1/projects', {
        json: true,
        qs: { authToken: MODULUS_TOKEN }
    }, function( e, response, body ){

        matches = body.filter(function( project ){
            return project.name === BRANCH ? true : false
        })

        if( matches.length > 0 ){
            DOMAIN = "http://" + matches[0].domain
            console.log(success("\u2713 pull request is now hosted at: " + DOMAIN))

            // Find branch pull request
            request.get('https://api.github.com/repos/' + ORG + '/' + REPO + '/pulls', {
                auth: github_auth,
                headers: user_agent,
                json: true
            }, function( e, response, body ){

                matches = body.filter(function( pull_request ){
                    return pull_request.head.ref === BRANCH ? true : false
                })

                PR = matches[0]

                if( PR ){
                    var updated = JSON.stringify({ "body": "**" + DOMAIN + "**\n\n---\n\n" + PR.body })

                    request.patch(PR.url, {
                        auth: github_auth,
                        headers: user_agent,
                        json: true,
                        body: updated
                    }, function(){
                        console.log(success("\u2713 pull request updated with review URL"))
                    })

                } else {
                    console.error(error("! pull request not found, something isn't quite right..."))
                }

            })

        }

    })

}

console.log(update('Looking for ' + BRANCH + ' project...'))

// Look for a project with a name matching the branch
request.get('https://sparkart-api.curvature.io/user/1/projects', {
    json: true,
    qs: { authToken: MODULUS_TOKEN }
}, function( error, response, body ){

    // Deploy with Modulus CLI
    var deploy = spawn('modulus', ['deploy', '-p', BRANCH, '--include-modules'])

    matches = body.filter(function( project ){
        return project.name === BRANCH ? true : false
    })

    PROJECT = matches[0]

    if( !PROJECT ){
        console.log(warn('Project not found, creating...'))

        var new_project = {
            "name": BRANCH,
            "creator": "1" // TODO: scope to a user per client
        }

        request.post('https://sparkart-api.curvature.io/project/create', {
            qs: { authToken: MODULUS_TOKEN },
            form: new_project
        }, function( e, response, body ){
            console.info(JSON.stringify(body, null, 4))
            setTimeout(function(){
                console.info(success('\u2713 Project created, deploying...'))
                deploy
            }, 5000)
        })
    } else {
        console.info(warn('\u2713 Project found, deploying...'))
        DOMAIN = PROJECT.domain
        deploy
    }

    deploy.stdout.pipe(process.stdout)

    deploy.stdout.on('close', function( code ){
        if( !DOMAIN ) addUrl()
    })

})
