rm -rf dist
tsc

parcel build src/mount/script.tsx -d dist/mount
