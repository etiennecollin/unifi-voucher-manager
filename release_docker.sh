#!/usr/bin/env bash

set -e # Exit on any error

# Initialize variables
VERSION=""
TAG_LATEST=false
IMAGE_NAME="etiennecollin/unifi-voucher-manager"

usage() {
  echo "Usage: ${0} <version> [-l|--latest]"
  echo "Example: ${0} 1.2.3 -l"
  exit 1
}

color() {
  local col="$1"
  shift
  local msg="$*"
  local code

  case "$col" in
  red) code="31" ;;    # errors
  green) code="32" ;;  # success
  yellow) code="33" ;; # warnings
  blue) code="34" ;;   # info
  *)
    echo "Usage: color {red|green|yellow|blue} \"message\"" >&2
    return 1
    ;;
  esac

  # ANSI escape: set color, print message, reset
  printf "\033[%sm%s\033[0m\n" "$code" "$msg"
}

# Parse arguments
while [[ $# -gt 0 ]]; do
  case $1 in
  -l | --latest)
    TAG_LATEST=true
    shift
    ;;
  -h | --help)
    usage
    ;;
  -*)
    color red "Unknown option ${1}"
    usage
    ;;
  *)
    if [ -z "$VERSION" ]; then
      VERSION="${1}"
    else
      color red "Error: Multiple version arguments provided"
      usage
    fi
    shift
    ;;
  esac
done

# Check if version argument is provided
if [ -z "${VERSION}" ]; then
  usage
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FULL_IMAGE_NAME="${IMAGE_NAME}:${VERSION}"

# Check if Dockerfile exists in the script directory
if [ ! -f "${SCRIPT_DIR}/Dockerfile" ]; then
  color red "Error: Dockerfile not found in ${SCRIPT_DIR}"
  exit 1
fi

color blue "Building Docker image..."
color blue "Image name: ${IMAGE_NAME}"
color blue "Version: ${VERSION}"
color blue "Build context: ${SCRIPT_DIR}"

# Build the Docker image
docker build -t "${FULL_IMAGE_NAME}" "${SCRIPT_DIR}"

# Tag as latest if flag is provided
if [ "${TAG_LATEST}" = true ]; then
  docker tag "${FULL_IMAGE_NAME}" "${IMAGE_NAME}:latest"
  color green "Successfully built ${FULL_IMAGE_NAME} and tagged as latest"
else
  color green "Successfully built ${FULL_IMAGE_NAME}"
fi

# Push the versioned image
color blue "Pushing ${FULL_IMAGE_NAME}..."
docker push "${FULL_IMAGE_NAME}"

# Push the latest tag if it was created
if [ "$TAG_LATEST" = true ]; then
  color blue "Pushing ${IMAGE_NAME}:latest..."
  docker push "${IMAGE_NAME}:latest"
  color green "Successfully pushed ${FULL_IMAGE_NAME} and ${IMAGE_NAME}:latest"
else
  color green "Successfully pushed ${FULL_IMAGE_NAME}"
fi
