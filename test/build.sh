rm -rf dist
tsc

parcel build src/mount/script.tsx -d dist/mount
parcel build src/passProps/script.tsx -d dist/passProps
parcel build src/elementRef/script.tsx -d dist/elementRef
