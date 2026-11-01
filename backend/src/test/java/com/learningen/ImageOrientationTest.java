package com.learningen;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.awt.image.BufferedImage;
import java.io.*;
import java.nio.ByteBuffer;
import java.nio.ByteOrder;
import java.util.Base64;
import java.util.List;
import java.util.UUID;
import javax.imageio.ImageIO;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.springframework.mock.env.MockEnvironment;
import org.springframework.mock.web.MockMultipartFile;
import static org.assertj.core.api.Assertions.assertThat;

class ImageOrientationTest {
    @ParameterizedTest
    @CsvSource({"1,2,3,0,0", "2,2,3,1,0", "3,2,3,1,2", "4,2,3,0,2", "5,3,2,0,0", "6,3,2,2,0", "7,3,2,2,1", "8,3,2,0,1"})
    void allExifTransformsPreserveExpectedCorner(int orientation,int width,int height,int x,int y) {
        var source=new BufferedImage(2,3,BufferedImage.TYPE_INT_RGB);
        source.setRGB(0,0,0xff123456);
        var result=ImageOrientation.apply(source,orientation);
        assertThat(result.getWidth()).isEqualTo(width);assertThat(result.getHeight()).isEqualTo(height);
        assertThat(result.getRGB(x,y)).isEqualTo(0xff123456);
    }
    @Test void indexedAndRgbPngHaveTheSamePixelFingerprint() throws Exception {
        var indexed=new BufferedImage(4,3,BufferedImage.TYPE_BYTE_BINARY);
        var rgb=new BufferedImage(4,3,BufferedImage.TYPE_INT_RGB);
        for(int y=0;y<3;y++) for(int x=0;x<4;x++) { int color=(x+y)%2==0?0xffffffff:0xff000000;indexed.setRGB(x,y,color);rgb.setRGB(x,y,color); }
        assertThat(prepare(indexed,"png").digest()).isEqualTo(prepare(rgb,"png").digest());
    }
    @ParameterizedTest
    @CsvSource({"true,6", "false,8"})
    void parsesExifEndianAndAppliesRotationBeforeRemovingMetadata(boolean little,int orientation) throws Exception {
        var image=new BufferedImage(20,30,BufferedImage.TYPE_INT_RGB);
        var output=new ByteArrayOutputStream();ImageIO.write(image,"jpeg",output);byte[] jpeg=output.toByteArray();
        var tiff=ByteBuffer.allocate(26).order(little?ByteOrder.LITTLE_ENDIAN:ByteOrder.BIG_ENDIAN);
        tiff.put((byte)(little?'I':'M')).put((byte)(little?'I':'M')).putShort((short)42).putInt(8).putShort((short)1)
            .putShort((short)0x112).putShort((short)3).putInt(1).putShort((short)orientation).putShort((short)0).putInt(0);
        var decorated=new ByteArrayOutputStream();decorated.write(jpeg,0,2);decorated.write(new byte[]{(byte)255,(byte)225,0,34,'E','x','i','f',0,0});decorated.write(tiff.array());decorated.write(jpeg,2,jpeg.length-2);
        assertThat(ImageOrientation.read(decorated.toByteArray())).isEqualTo(orientation);
        var picture=tutor().prepare(input(),List.of(new MockMultipartFile("images","phone.jpg","image/jpeg",decorated.toByteArray()))).pictures().get(0);
        byte[] clean=Base64.getDecoder().decode(picture.dataUrl().substring(picture.dataUrl().indexOf(',')+1));
        var decoded=ImageIO.read(new ByteArrayInputStream(clean));
        assertThat(decoded.getWidth()).isEqualTo(30);assertThat(decoded.getHeight()).isEqualTo(20);
        assertThat(ImageOrientation.read(clean)).isEqualTo(1);
    }
    @Test void malformedExifFallsBackWithoutReadingOutsideBounds() {
        assertThat(ImageOrientation.read(new byte[]{(byte)255,(byte)216,(byte)255,(byte)225,127,127})).isEqualTo(1);
    }
    private ImageTutor tutor() { return new ImageTutor(new MockEnvironment().withProperty("app.ai.vision.enabled","true").withProperty("app.ai.vision.model","vision").withProperty("app.ai.base-url","http://localhost/v1").withProperty("app.ai.api-key","fixture"),new ObjectMapper()); }
    private ImageTutor.Input input() { return new ImageTutor.Input("","",UUID.randomUUID(),null,ImageTutor.Task.DETAILED,"",""); }
    private ImageTutor.Picture prepare(BufferedImage image,String format) throws Exception {
        var output=new ByteArrayOutputStream();ImageIO.write(image,format,output);
        return tutor().prepare(input(),List.of(new MockMultipartFile("images","test."+format,"image/"+format,output.toByteArray()))).pictures().get(0);
    }
}
