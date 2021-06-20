# TakeHomeTest
##Part I
see Part I responses

##Part II

###githubAPIChallenge.js 
A lightweight web service that listens to github create repository events,
then call github API to protect the defaul main branch of the newly created
repository, and then make another github API call to create an issue and @mention
the sender self.

####Installation
Step 1: Type the follow command to install node

Step 2: Type the following two command to install WebSocket and Axios
  node install ws
  node install axios
Step 3: Copy githubAPIChallenge.js from git to your current directory

####Run
Step 1: From your current directory (node is available and githubAPIChallenge.js is in the current directory), type the follow command to run
  node githubAPIChallenge.js

Then, you will see the following message:
    Ready to accept github event!

Step 2: Login to github to create a new repository under apihuang organization. You will then see messages simialr to the following:

Received github event: repo24 repository has just been created

Main branch of apihuang/repo24 repository has been protected according to team policy.
Protection URL: https://api.github.com/repos/apihuang/repo24/branches/main/protection
required_status_checks.strict:true
enforce_admins.enabled:true
required_pull_request_reviews.require_code_owner_reviews:true


An issue has been created for a newly created repository.
Issue title: An Issue for Newly Created Repository
Issue URL: https://api.github.com/repos/apihuang/repo24/issues/1
