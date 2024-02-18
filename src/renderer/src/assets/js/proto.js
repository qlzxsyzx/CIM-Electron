/*eslint-disable block-scoped-var, id-length, no-control-regex, no-magic-numbers, no-prototype-builtins, no-redeclare, no-shadow, no-var, sort-vars*/
import * as $protobuf from "protobufjs/light";

const $root = ($protobuf.roots["default"] || ($protobuf.roots["default"] = new $protobuf.Root()))
.setOptions({
  java_package: "com.qlzxsyzx.server.netty.proto",
  java_outer_classname: "CustomMessage"
})
.addJSON({
  HeadType: {
    values: {
      LOGIN_REQUEST: 0,
      LOGIN_RESPONSE: 1,
      KEEP_ALIVE_REQUEST: 2,
      KEEP_ALIVE_RESPONSE: 3,
      MESSAGE_REQUEST: 4,
      SYSTEM_BROADCAST: 5,
      SYSTEM_NOTIFICATION: 6
    }
  },
  LoginRequest: {
    fields: {
      userId: {
        type: "int64",
        id: 1
      },
      platform: {
        type: "string",
        id: 2
      },
      token: {
        type: "string",
        id: 3
      }
    }
  },
  LoginResponse: {
    fields: {
      code: {
        type: "int32",
        id: 1
      },
      msg: {
        type: "string",
        id: 2
      }
    }
  },
  KeepAliveRequest: {
    fields: {
      userId: {
        type: "int64",
        id: 1
      },
      platform: {
        type: "string",
        id: 2
      }
    }
  },
  KeepAliveResponse: {
    fields: {
      code: {
        type: "int32",
        id: 1
      },
      msg: {
        type: "string",
        id: 2
      }
    }
  },
  MessageRequest: {
    fields: {
      messageId: {
        type: "int64",
        id: 1
      },
      roomId: {
        type: "int64",
        id: 2
      },
      senderId: {
        type: "int64",
        id: 3
      },
      receiverId: {
        type: "int64",
        id: 4
      },
      type: {
        type: "int32",
        id: 5
      },
      content: {
        type: "string",
        id: 6
      },
      fileInfo: {
        type: "FileInfo",
        id: 7
      },
      createTime: {
        type: "string",
        id: 8
      }
    }
  },
  FileInfo: {
    fields: {
      recordId: {
        type: "int64",
        id: 1
      },
      realName: {
        type: "string",
        id: 2
      },
      ext: {
        type: "string",
        id: 3
      },
      fileSize: {
        type: "int64",
        id: 4
      }
    }
  },
  SystemBroadcast: {
    fields: {
      type: {
        type: "int32",
        id: 1
      },
      code: {
        type: "int32",
        id: 2
      },
      content: {
        type: "string",
        id: 3
      },
      createTime: {
        type: "string",
        id: 4
      }
    }
  },
  SystemNotification: {
    fields: {
      type: {
        type: "int32",
        id: 1
      },
      code: {
        type: "int32",
        id: 2
      },
      userId: {
        type: "int64",
        id: 3
      },
      platform: {
        type: "string",
        id: 4
      },
      content: {
        type: "string",
        id: 5
      },
      createTime: {
        type: "string",
        id: 6
      }
    }
  },
  Message: {
    oneofs: {
      body: {
        oneof: [
          "loginRequest",
          "loginResponse",
          "keepAliveRequest",
          "keepAliveResponse",
          "messageRequest",
          "systemBroadcast",
          "systemNotification"
        ]
      }
    },
    fields: {
      headType: {
        type: "int32",
        id: 1
      },
      loginRequest: {
        type: "LoginRequest",
        id: 2
      },
      loginResponse: {
        type: "LoginResponse",
        id: 3
      },
      keepAliveRequest: {
        type: "KeepAliveRequest",
        id: 4
      },
      keepAliveResponse: {
        type: "KeepAliveResponse",
        id: 5
      },
      messageRequest: {
        type: "MessageRequest",
        id: 6
      },
      systemBroadcast: {
        type: "SystemBroadcast",
        id: 7
      },
      systemNotification: {
        type: "SystemNotification",
        id: 8
      }
    }
  }
});

export { $root as default };
