package com.learningen;

import com.learningen.data.BackupService;
import com.learningen.learning.service.CourseService;
import com.learningen.study.StudyService;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.*;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest @ActiveProfiles("test")
@EnabledIfEnvironmentVariable(named="TEST_POSTGRES_URL",matches=".+")
class PostgresIntegrationTest {
    @DynamicPropertySource static void database(DynamicPropertyRegistry properties) {
        properties.add("spring.datasource.url",()->System.getenv("TEST_POSTGRES_URL"));
        properties.add("spring.datasource.username",()->System.getenv("TEST_POSTGRES_USER"));
        properties.add("spring.datasource.password",()->System.getenv("TEST_POSTGRES_PASSWORD"));
    }
    @Autowired JdbcTemplate db;@Autowired com.learningen.notebook.NotebookService notebook;@Autowired ReviewController reviews;
    @Autowired StudyService study;@Autowired CourseService courses;@Autowired BackupService backup;@Autowired ObjectMapper mapper;
    @Test void migrationsOwnerScopedNotebookReviewAndBackupWorkOnPostgres() throws Exception {
        try(var connection=db.getDataSource().getConnection()) { assertThat(connection.getMetaData().getDatabaseProductName()).isEqualTo("PostgreSQL"); }
        UUID owner=UUID.randomUUID();String email=owner+"@example.test";
        db.update("insert into accounts(id,email,password_hash,display_name) values(?,?,'unused','Postgres tester')",owner,email);
        var item=notebook.create(owner,new com.learningen.notebook.NotebookDtos.Input("test "+UUID.randomUUID(),"meaning","context","example","notes","integration",true));
        var auth=org.springframework.security.authentication.UsernamePasswordAuthenticationToken.authenticated(email,"unused",List.of());
        var card=reviews.list(auth,true).get(0);
        reviews.review(auth,card.id(),new ReviewController.Review(UUID.randomUUID(),Sm2Scheduler.Rating.GOOD,card.version()));
        var session=study.start(owner,new StudyService.Start(UUID.randomUUID(),5));study.update(owner,session.id(),new StudyService.Update(0,0,true));
        assertThat(courses.courses(owner)).isNotEmpty();var data=mapper.valueToTree(backup.export(owner));backup.clear(owner);backup.restore(owner,data);
        assertThat(notebook.get(owner,item.id()).meaning()).isEqualTo("meaning");assertThat(reviews.list(auth,false).get(0).version()).isEqualTo(1);
    }
}
