#include <stdio.h>
#include <stdlib.h>
#include <stdbool.h>

#ifdef _WIN32
#define EXPORT __declspec(dllexport)
#else
#define EXPORT
#endif

typedef struct {
    FILE *fp;
} FileHandler;

// initialize a file handler
EXPORT FileHandler* open_file(const char* file_path, bool writing) {
    FileHandler* handle = malloc(sizeof(FileHandler));

    if (!handle) return NULL;

    handle->fp = fopen(file_path, writing ? "wb" : "rb");

    if (handle->fp) {
        return handle;
    }
    free(handle);
    return NULL;
}

// write a chunk to file
EXPORT bool write_chunk_to_file(FileHandler* handle, const char *data, size_t length) {
    if (!handle || !handle->fp) return false;
    return fwrite(data, 1, length, handle->fp) == length;
}

// read a chunk from file
EXPORT size_t read_chunk_from_file(FileHandler* handle, char* buffer, size_t max_len) {
    if (!handle || !handle->fp) return 0;
    return fread(buffer, 1, max_len, handle->fp);
}

// close a file handler
EXPORT void close_handler(FileHandler* handle) {
    if (handle) {
        if (handle->fp) fclose(handle->fp);
        free(handle);
    }
}