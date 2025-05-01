from ctypes import cdll, c_char_p, c_bool, c_void_p, c_size_t, POINTER, create_string_buffer

lib = cdll.LoadLibrary("./fastFileReadAndWrite.so")

class CStreamIO:
    def __init__(self):
        self._FileHandlePtr = POINTER(c_void_p)

        lib.open_file.argtypes = [c_char_p, c_bool]
        lib.open_file.restype = c_void_p

        lib.write_chunk_to_file.argtypes = [c_void_p, c_char_p, c_size_t]
        lib.write_chunk_to_file.restype = c_bool

        lib.read_chunk_from_file.argtypes = [c_void_p, c_char_p, c_size_t]
        lib.read_chunk_from_file.restype = c_size_t

        lib.close_handler.argtypes = [c_void_p]
        lib.close_handler.restype = None

    def open_write(self, path):
        return lib.open_file(path.encode('utf-8'), True)
    
    def open_read(self, path):
        return lib.open_file(path.encode('utf-8'), False)

    def write_chunk(self, handle, data):
        return lib.write_chunk_to_file(handle, data, len(data))

    def read_chunk(self, handle, buf_size=65536):
        buf = create_string_buffer(buf_size)
        n = lib.read_chunk_from_file(handle, buf, buf_size)
        return buf.raw[:n] if n > 0 else None

    def close(self, handle):
        lib.close_handler(handle)

cstream = CStreamIO()