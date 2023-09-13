#!/bin/bash

######################################################
# This test file exists to help with testing in bash #
######################################################

set -e 
set -o pipefail

# NOTE: This would ideally assert the output too, not just proper exiting. I couldn't come up with a clean way for now, and there are plenty of other tests for the output.

lockdb lock sales || { echo 'Lock failed' ; exit 1; }
# Should output "true"

lockdb lock backup || { echo 'Lock failed' ; exit 1; }
# Should output "false"

lockdb check sales || { echo 'Check failed' ; exit 1; }
# Should output "true"

lockdb lock sales -w 10 && { echo 'Lock failed' ; exit 1; }
# Should output "TimeoutError"

lockdb unlock sales || { echo 'Lock failed' ; exit 1; }
# Should output "true"

lockdb check sales || { echo 'Check failed' ; exit 1; }
# Should output "false"

lockdb check backup || { echo 'Check failed' ; exit 1; }
# Should output "true"

echo "Success!"
