import * as Peer from 'simple-peer';
import * as wrtc from 'wrtc';
var parser = require('socket.io-parser');
import * as hasBin from "has-binary";
import * as toArray from "to-array";
var encoder = new parser.Encoder();
var decoder = new parser.Decoder();

export class PeerConnection extends Peer {
    constructor(initiator: boolean) {
        super({ initiator, trickle: true, wrtc })
    }

    on(packet, listener): this {
        var args = packet.data || [];
        if (null != packet.id) {
            args.push(this.ack(packet.id));
        }

        decoder.add(args); //since I've added to the decoder, I need to listen to the decoded event instead of on data
        return this;
    }

    ack (id) {
        var self = this;
        var sent = false;
        return function () {
          // prevent double callbacks
          if (sent) return;
          sent = true;
          var args = toArray(arguments);
      
        //   self.packet({ //this must come from engine.io
        //     type: hasBin(args) ? parser.BINARY_ACK : parser.ACK,
        //     id: id,
        //     data: args
        //   });
        };
      };

    send(data) {
        var args = toArray(arguments)
        var parserType = parser.EVENT // default
        if (hasBin(args)) { parserType = parser.BINARY_EVENT } // binary
        var packet = { type: parserType, data: args }
        let sendFunction = super.send;

        encoder.encode(packet, function (encodedPackets) {
            if (encodedPackets[1] instanceof ArrayBuffer) {
                PeerConnection._sendArray(encodedPackets, sendFunction)
            } else if (encodedPackets) {
                for (var i = 0; i < encodedPackets.length; i++) {
                    sendFunction(encodedPackets[i])
                }
            } else {
                throw new Error('Encoding error')
            }
        })
    }

    static _sendArray(arr, sendFunction) {
        var firstPacket = arr[0]
        var interval = 5000
        var arrLength = arr[1].byteLength
        var nChunks = Math.ceil(arrLength / interval)
        var packetData = firstPacket.substr(0, 1) + nChunks + firstPacket.substr(firstPacket.indexOf('-'))
        sendFunction(packetData)
        this.binarySlice(arr[1], interval, sendFunction)
    }
      
    static binarySlice = function (arr, interval, callback) {
        for (var start = 0; start < arr.byteLength; start += interval) {
          var chunk = arr.slice(start, start + interval)
          callback.call(this, chunk)
        }
    }
}
