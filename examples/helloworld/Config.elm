module Config exposing (init)

import Fn.V1 as Fn exposing (Engine(..), Env, EnvMode(..), HandlerRef(..))
import Json.Encode as Encode exposing (Encoder, Value)


type Middleware
    = Logging HandlerRef (List (Encoder Value))


init : Env -> Fn.Endpoint
init { mode } =
    Fn.endpoint
        { handler = DefaultHandlerFileImport "./index.js"
        , pipeline =
            { after =
                Logging (DefaultMiddlewareFileImport "./fn/loggingMiddleware.js")
                    [ Encode.string "after"
                    ]
            , before =
                Logging (DefaultMiddlewareFileImport "./fn/loggingMiddleware.js")
                    [ Encode.string "before"
                    ]
            , runtime = DefaultRuntimeFileImport "./fn/lib.js"
            }
        }
