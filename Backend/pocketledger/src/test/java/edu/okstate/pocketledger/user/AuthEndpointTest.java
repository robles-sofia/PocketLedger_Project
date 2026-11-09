package edu.okstate.pocketledger.user;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

// integration tests
// @SpringBootTest starts entire application, but against H2 db instead of Aiven
// @AutoConfigureMockMvc gives MockMvc which sends real requests thrugh the real controllers
// security filters without opening a port (fast)
@SpringBootTest
@AutoConfigureMockMvc
class AuthEndpointTest {
    
    // spring gives the MockMvc it built
    @Autowired 
    private MockMvc mockMvc;

    @Test 
    void registeringThenLoggingInReturnsAToken() throws Exception {

        // same body works for both calls since register and login take same 2 fields
        String body = """
                {"email":"integration@okstate.edu","password":"testpassword"}
                """;

                // register first
                // 201 for successful register
                mockMvc.perform(post("/api/auth/register").contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.token").exists());

                // login next
                // jsonPath goes into the response JSON
                // $ is top level so $.user.email reads email out of nested user
                mockMvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").exists())
                .andExpect(jsonPath("$.user.email").value("integration@okstate.edu"));
    }


    @Test 
    void registeringTheSameEmailTwiceIsRejected() throws Exception {
        String body = """
                {"email":"duplicate@okstate.edu","password":"testpassword"}
                """;

                // first one goes through, just setup, don't assert on it
                mockMvc.perform(post("/api/auth/register").contentType(MediaType.APPLICATION_JSON).content(body));

                // second one should be refused
                // checks error code
                mockMvc.perform(post("/api/auth/register").contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(jsonPath("$.error.code").value("EMAIL_TAKEN"));
    }


    @Test 
    void wrongPasswordIs401AndSaysNothingUseful() throws Exception {

        // set up real account
        mockMvc.perform(post("/api/auth/register").contentType(MediaType.APPLICATION_JSON).content("""
                {"email":"wrongpass@okstate.edu","password":"testpassword"}
                """));

        // right email, wrong pass
        // unit test checks exception type, this checks what API sends back
        mockMvc.perform(post("api/auth/login").contentType(MediaType.APPLICATION_JSON).content("""
                {"email":"wrongpass@okstate.edu","password":"notmypassword"}
                """))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.error.code").value("INVALID_CREDENTIALS"));
    }


    @Test 
    void aProtectedEndpointWithNoTokenIs401() throws Exception {

        // no token, security should reject it before controller runs
        // 500 here instead of 401 menas request got through then crashed
        mockMvc.perform(get("/api/budgets").param("month", "2026-11"))
        .andExpect(status().isUnauthorized());
    }
}
